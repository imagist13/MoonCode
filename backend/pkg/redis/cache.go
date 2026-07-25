package redis

import (
	"context"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

func Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return RDB.Set(ctx, key, value, expiration).Err()
}

func Get(ctx context.Context, key string) (string, error) {
	return RDB.Get(ctx, key).Result()
}

func Incr(ctx context.Context, key string) (int64, error) {
	return RDB.Incr(ctx, key).Result()
}

func Decr(ctx context.Context, key string) (int64, error) {
	return RDB.Decr(ctx, key).Result()
}

func Del(ctx context.Context, key string) error {
	return RDB.Del(ctx, key).Err()
}

func Exists(ctx context.Context, key string) (bool, error) {
	result, err := RDB.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return result == 1, nil
}

func SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) (bool, error) {
	return RDB.SetNX(ctx, key, value, expiration).Result()
}

func GetInt(ctx context.Context, key string) (int, error) {
	val, err := RDB.Get(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(val)
}

func LPush(ctx context.Context, key string, values ...interface{}) error {
	return RDB.LPush(ctx, key, values...).Err()
}

func RPush(ctx context.Context, key string, values ...interface{}) error {
	return RDB.RPush(ctx, key, values...).Err()
}

func LRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
	return RDB.LRange(ctx, key, start, stop).Result()
}

func SAdd(ctx context.Context, key string, members ...interface{}) error {
	return RDB.SAdd(ctx, key, members...).Err()
}

func SRem(ctx context.Context, key string, members ...interface{}) error {
	return RDB.SRem(ctx, key, members...).Err()
}

func SIsMember(ctx context.Context, key string, member interface{}) (bool, error) {
	return RDB.SIsMember(ctx, key, member).Result()
}

var _ redis.UniversalClient = RDB