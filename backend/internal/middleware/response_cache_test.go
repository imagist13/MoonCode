package middleware

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

// memCacheStore 内存版 cacheStore，用于验证中间件行为而不依赖 Redis。
type memCacheStore struct {
	mu   sync.Mutex
	data map[string][]byte
	sets int
}

func newMemCacheStore() *memCacheStore {
	return &memCacheStore{data: make(map[string][]byte)}
}

func (s *memCacheStore) Get(_ context.Context, key string) ([]byte, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	v, ok := s.data[key]
	if !ok {
		return nil, fmt.Errorf("cache miss")
	}
	return v, nil
}

func (s *memCacheStore) Set(_ context.Context, key string, value []byte, _ time.Duration) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[key] = value
	s.sets++
	return nil
}

func (s *memCacheStore) put(key string, value []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[key] = value
}

func (s *memCacheStore) setCount() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.sets
}

func TestIsCacheablePath(t *testing.T) {
	cases := []struct {
		path string
		want bool
	}{
		{"/api/v1/articles", true},
		{"/api/v1/articles/12", true},
		{"/api/v1/articles/archives", true},
		{"/api/v1/articles/condition", true},
		{"/api/v1/articles/search", false},
		{"/api/v1/articles/search/extra", false},
		{"/api/v1/categories", true},
		{"/api/v1/tags", true},
		{"/api/v1/music/enabled", true},
		{"/api/v1/music/other", false},
		{"/api/v1/website/config", true},
		{"/api/v1/about", true},
		// 路径段边界：不应把 articlesXxx 当成 articles
		{"/api/v1/articlesX", false},
		// 后台与管理接口不缓存
		{"/api/v1/admin/articles", false},
	}
	for _, tc := range cases {
		if got := isCacheablePath(tc.path); got != tc.want {
			t.Errorf("isCacheablePath(%q) = %v, want %v", tc.path, got, tc.want)
		}
	}
}

func TestIsSuccessJSON(t *testing.T) {
	cases := []struct {
		body string
		want bool
	}{
		{`{"code":20000,"flag":true,"data":[]}`, true},
		{`{"code":50000,"flag":false,"data":null}`, false},
		{`<html>error</html>`, false},
		{``, false},
	}
	for _, tc := range cases {
		if got := isSuccessJSON([]byte(tc.body)); got != tc.want {
			t.Errorf("isSuccessJSON(%q) = %v, want %v", tc.body, got, tc.want)
		}
	}
}

func TestResponseCacheMissThenHit(t *testing.T) {
	store := newMemCacheStore()
	var calls int
	r := gin.New()
	r.Use(responseCache(store, time.Minute))
	r.GET("/api/v1/articles", func(c *gin.Context) {
		calls++
		c.JSON(http.StatusOK, gin.H{"code": 20000, "flag": true, "data": gin.H{"n": calls}})
	})

	first := httptest.NewRecorder()
	r.ServeHTTP(first, httptest.NewRequest(http.MethodGet, "/api/v1/articles?current=1&size=10", nil))
	if first.Code != http.StatusOK || first.Header().Get("X-Cache") != "MISS" {
		t.Fatalf("首次请求应为 200/MISS，得到 code=%d X-Cache=%q", first.Code, first.Header().Get("X-Cache"))
	}
	if store.setCount() != 1 {
		t.Fatalf("首次请求应写入 1 次缓存，实际 %d", store.setCount())
	}

	second := httptest.NewRecorder()
	r.ServeHTTP(second, httptest.NewRequest(http.MethodGet, "/api/v1/articles?current=1&size=10", nil))
	if second.Header().Get("X-Cache") != "HIT" {
		t.Fatalf("第二次请求应命中缓存，X-Cache=%q", second.Header().Get("X-Cache"))
	}
	if calls != 1 {
		t.Fatalf("命中缓存后 handler 不应再执行，实际调用 %d 次", calls)
	}
	if second.Body.String() != first.Body.String() {
		t.Fatalf("缓存响应与原始响应不一致:\nfirst=%s\nsecond=%s", first.Body.String(), second.Body.String())
	}
}

func TestResponseCacheSkipsFailedResult(t *testing.T) {
	store := newMemCacheStore()
	var calls int
	r := gin.New()
	r.Use(responseCache(store, time.Minute))
	r.GET("/api/v1/articles", func(c *gin.Context) {
		calls++
		c.JSON(http.StatusOK, gin.H{"code": 50000, "flag": false, "message": "db error"})
	})

	for i := 0; i < 2; i++ {
		w := httptest.NewRecorder()
		r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/api/v1/articles", nil))
		if got := w.Header().Get("X-Cache"); got != "BYPASS" {
			t.Errorf("业务失败响应应标记 BYPASS，得到 %q", got)
		}
	}
	if calls != 2 {
		t.Errorf("业务失败响应不应缓存，handler 应执行 2 次，实际 %d 次", calls)
	}
	if store.setCount() != 0 {
		t.Errorf("业务失败响应不应写入缓存，实际写入 %d 次", store.setCount())
	}
}

func TestResponseCacheNonWhitelistedPathPassThrough(t *testing.T) {
	store := newMemCacheStore()
	r := gin.New()
	r.Use(responseCache(store, time.Minute))
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/health", nil))
	if w.Header().Get("X-Cache") != "" {
		t.Errorf("非白名单路径不应加 X-Cache 头，得到 %q", w.Header().Get("X-Cache"))
	}
	if store.setCount() != 0 {
		t.Errorf("非白名单路径不应写缓存")
	}
}

func TestResponseCachePostBypass(t *testing.T) {
	store := newMemCacheStore()
	r := gin.New()
	r.Use(responseCache(store, time.Minute))
	r.POST("/api/v1/messages", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"flag": true})
	})

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodPost, "/api/v1/messages", nil))
	if store.setCount() != 0 {
		t.Errorf("POST 请求不应被缓存")
	}
	if w.Body.Len() == 0 {
		t.Errorf("POST 响应应正常透传")
	}
}

func TestResponseCacheNoCacheHeader(t *testing.T) {
	store := newMemCacheStore()
	var calls int
	r := gin.New()
	r.Use(responseCache(store, time.Minute))
	r.GET("/api/v1/about", func(c *gin.Context) {
		calls++
		c.JSON(http.StatusOK, gin.H{"flag": true})
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/about", nil)
	req.Header.Set("Cache-Control", "no-cache")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Header().Get("X-Cache") != "BYPASS" {
		t.Errorf("no-cache 应 BYPASS，得到 %q", w.Header().Get("X-Cache"))
	}
	if store.setCount() != 0 {
		t.Errorf("no-cache 请求不应写缓存")
	}
}

// TestResponseCachePanicStillRecovered 缓存缓冲不能吞掉 gin.Recovery 的 500 响应。
func TestResponseCachePanicStillRecovered(t *testing.T) {
	store := newMemCacheStore()
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(responseCache(store, time.Minute))
	r.GET("/api/v1/articles", func(c *gin.Context) {
		panic("boom")
	})

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/api/v1/articles", nil))
	// gin.Recovery 只写状态码不写 body，因此这里只校验状态码：
	// Writer 未还原时 500 会写进缓冲区，客户端只会看到 httptest 默认的 200。
	if w.Code != http.StatusInternalServerError {
		t.Fatalf("panic 后应返回 500，得到 %d", w.Code)
	}
	if store.setCount() != 0 {
		t.Error("panic 响应不应写入缓存")
	}
}

func TestResponseCacheDisabledTTL(t *testing.T) {
	r := gin.New()
	r.Use(responseCache(newMemCacheStore(), 0))
	r.GET("/api/v1/articles", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"flag": true})
	})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/api/v1/articles", nil))
	if w.Header().Get("X-Cache") != "" {
		t.Errorf("TTL<=0 时应完全关闭缓存")
	}
}
