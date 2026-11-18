package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

const (
	responseCacheKeyPrefix = "moon:resp:v1:"
	// maxCacheBody 超过该体积的响应不写入缓存，避免归档/大列表挤占 Redis 内存。
	maxCacheBody = 512 << 10
	// cacheOpTimeout Redis 读写超时；缓存只是加速手段，不能拖慢主请求。
	cacheOpTimeout = 100 * time.Millisecond
)

// cacheStore 抽象 Redis 读写，便于单元测试注入内存实现。
type cacheStore interface {
	Get(ctx context.Context, key string) ([]byte, error)
	Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
}

type redisCacheStore struct {
	rdb *redis.Client
}

func (s redisCacheStore) Get(ctx context.Context, key string) ([]byte, error) {
	return s.rdb.Get(ctx, key).Bytes()
}

func (s redisCacheStore) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
	return s.rdb.Set(ctx, key, value, ttl).Err()
}

// CachedPublicPaths 公开读接口白名单：只有这些前缀下的 GET 响应会被缓存。
var CachedPublicPaths = []string{
	"/api/v1/articles",
	"/api/v1/categories",
	"/api/v1/tags",
	"/api/v1/comments",
	"/api/v1/talks",
	"/api/v1/links",
	"/api/v1/music/enabled",
	"/api/v1/messages",
	"/api/v1/website/config",
	"/api/v1/about",
}

// cacheExcludedPaths 从白名单中排除的具体路径。
//
// 搜索接口的查询词基数不可控，缓存 key 会被任意请求撑大，反而污染 Redis；
// ES 查询本身也不是当前瓶颈，交给搜索服务自己的缓存策略更合适。
var cacheExcludedPaths = []string{
	"/api/v1/articles/search",
}

// ResponseCache 为公开读接口提供 Redis 响应缓存。
//
// 只缓存「GET + 白名单路径 + HTTP 200 + flag=true 的 JSON」；
// 项目约定业务失败也会返回 HTTP 200（body 中 flag=false），因此必须校验 body，
// 否则一次数据库抖动也会被缓存 30 秒。
//
// Redis 异常时 fail-open：直接透传后端响应，只影响命中率不影响可用性。
// 缓存为 TTL 失效（默认 30s）的最终一致模型，后台发布内容最多延迟一个 TTL 可见。
func ResponseCache(rdb *redis.Client, ttl time.Duration) gin.HandlerFunc {
	if rdb == nil || ttl <= 0 {
		return func(c *gin.Context) { c.Next() }
	}
	return responseCache(redisCacheStore{rdb: rdb}, ttl)
}

func responseCache(store cacheStore, ttl time.Duration) gin.HandlerFunc {
	if store == nil || ttl <= 0 {
		return func(c *gin.Context) { c.Next() }
	}
	return func(c *gin.Context) {
		if c.Request.Method != http.MethodGet || !isCacheablePath(c.Request.URL.Path) {
			c.Next()
			return
		}
		// 调试/强制刷新：带 Cache-Control: no-cache 时跳过读和写。
		if strings.Contains(strings.ToLower(c.Request.Header.Get("Cache-Control")), "no-cache") {
			c.Header("X-Cache", "BYPASS")
			c.Next()
			return
		}

		key := responseCacheKey(c.Request)
		readCtx, cancelRead := context.WithTimeout(c.Request.Context(), cacheOpTimeout)
		cached, err := store.Get(readCtx, key)
		cancelRead()
		if err == nil && len(cached) > 0 {
			c.Header("X-Cache", "HIT")
			c.Data(http.StatusOK, "application/json; charset=utf-8", cached)
			c.Abort()
			return
		}

		// 先缓冲响应，等确认是成功结果后再决定是否写入缓存。
		recorder := &cacheRecorder{ResponseWriter: c.Writer, status: http.StatusOK}
		c.Writer = recorder
		func() {
			// 用 defer 保证 handler panic 时也先还原 Writer：
			// 否则外层的 gin.Recovery 会把 500 写进缓冲区，客户端收到空响应。
			defer func() { c.Writer = recorder.ResponseWriter }()
			c.Next()
		}()

		body := recorder.body.Bytes()
		if recorder.status != http.StatusOK || !isSuccessJSON(body) {
			c.Header("X-Cache", "BYPASS")
			flushBuffered(c.Writer, recorder.status, body)
			return
		}

		c.Header("X-Cache", "MISS")
		flushBuffered(c.Writer, recorder.status, body)

		if len(body) > maxCacheBody {
			return
		}
		// 写缓存放在响应之后：Redis 抖动最多影响后续请求的命中率，
		// 不会把它的延迟叠加到当前请求上。
		writeCtx, cancelWrite := context.WithTimeout(context.Background(), cacheOpTimeout)
		defer cancelWrite()
		_ = store.Set(writeCtx, key, body, ttl)
	}
}

// cacheRecorder 把 handler 的输出暂存到内存，同时不向真实连接写任何内容。
type cacheRecorder struct {
	gin.ResponseWriter
	body        bytes.Buffer
	status      int
	wroteHeader bool
}

func (w *cacheRecorder) WriteHeader(code int) {
	w.status = code
	w.wroteHeader = true
}

// WriteHeaderNow 延迟到缓冲结束后统一提交。
func (w *cacheRecorder) WriteHeaderNow() { w.wroteHeader = true }

func (w *cacheRecorder) Write(p []byte) (int, error) { return w.body.Write(p) }

func (w *cacheRecorder) Written() bool { return w.wroteHeader }

func (w *cacheRecorder) Size() int { return w.body.Len() }

func (w *cacheRecorder) Status() int { return w.status }

func flushBuffered(w gin.ResponseWriter, status int, body []byte) {
	if status != http.StatusOK {
		w.WriteHeader(status)
	}
	_, _ = w.Write(body)
}

// isCacheablePath 按路径段边界匹配白名单，避免 /articles 误匹配 /articlesXxx。
func isCacheablePath(path string) bool {
	for _, excluded := range cacheExcludedPaths {
		if pathMatchesPrefix(path, excluded) {
			return false
		}
	}
	for _, prefix := range CachedPublicPaths {
		if pathMatchesPrefix(path, prefix) {
			return true
		}
	}
	return false
}

func pathMatchesPrefix(path, prefix string) bool {
	if path == prefix {
		return true
	}
	if strings.HasPrefix(path, prefix) && len(path) > len(prefix) {
		next := path[len(prefix)]
		if next == '/' || next == '?' {
			return true
		}
	}
	return false
}

func responseCacheKey(req *http.Request) string {
	key := responseCacheKeyPrefix + req.URL.Path
	if req.URL.RawQuery != "" {
		key += "?" + req.URL.RawQuery
	}
	return key
}

// isSuccessJSON 判断响应是否为统一结构中的成功结果。
func isSuccessJSON(body []byte) bool {
	var probe struct {
		Flag bool `json:"flag"`
	}
	if err := json.Unmarshal(body, &probe); err != nil {
		return false
	}
	return probe.Flag
}
