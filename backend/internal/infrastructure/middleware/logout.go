package middleware

import (
	"blog-backend/pkg/redis"
	"context"
	"time"
)

const JWTBlacklistPrefix = "jwt_blacklist:"

func AddTokenToBlacklist(ctx context.Context, token string, expireAt int64) error {
	expiration := time.Until(time.Unix(expireAt, 0))
	return redis.Set(ctx, JWTBlacklistPrefix+token, "1", expiration)
}

func IsTokenBlacklisted(ctx context.Context, token string) (bool, error) {
	return redis.Exists(ctx, JWTBlacklistPrefix+token)
}