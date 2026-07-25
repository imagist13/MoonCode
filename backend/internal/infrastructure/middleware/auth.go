package middleware

import (
	"blog-backend/internal/infrastructure/response"
	"blog-backend/pkg/config"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			response.Error(c, 401, "未登录")
			c.Abort()
			return
		}

		token = strings.TrimPrefix(token, "Bearer ")

		blacklisted, err := IsTokenBlacklisted(c.Request.Context(), token)
		if err != nil {
			response.Error(c, 500, "验证失败")
			c.Abort()
			return
		}
		if blacklisted {
			response.Error(c, 401, "token已过期")
			c.Abort()
			return
		}

		claims := &jwt.MapClaims{}
		_, err = jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.GetConfig().JWT.Secret), nil
		})

		if err != nil {
			response.Error(c, 401, "token无效")
			c.Abort()
			return
		}

		userID, ok := (*claims)["user_id"].(float64)
		if !ok {
			response.Error(c, 401, "token无效")
			c.Abort()
			return
		}

		c.Set("user_id", uint(userID))
		c.Next()
	}
}
