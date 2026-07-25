package redis

import (
	"blog-backend/pkg/config"

	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client

func InitRedis() error {
	cfg := config.GetConfig()
	RDB = redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Addr(),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})
	return nil
}

func GetRedis() *redis.Client {
	return RDB
}