package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

/** 允许的前端来源（开发态）。 */
var allowedOrigins = map[string]struct{}{
	"http://localhost:3000": {},
	"http://127.0.0.1:3000": {},
}

/** 当前请求是否来自允许的前端来源。 */
func isAllowedOrigin(origin string) bool {
	if origin == "" {
		return false
	}
	_, ok := allowedOrigins[origin]
	return ok
}

/**
 * CORS 中间件：
 *   - 仅在允许的 origin 列表内下发 ACAO；
 *   - 始终启用 Access-Control-Allow-Credentials，便于浏览器随 fetch 带 cookie；
 *   - Vary: Origin，避免代理/CDN 跨用户串缓存。
 */
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if isAllowedOrigin(origin) {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Vary", "Origin")
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}