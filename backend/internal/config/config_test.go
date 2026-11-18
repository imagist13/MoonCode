package config

import (
	"testing"
	"time"
)

func TestApplyDefaultsConnectionPool(t *testing.T) {
	cfg := &Config{}
	applyDefaults(cfg)

	if cfg.Database.MaxOpenConns != 30 {
		t.Errorf("MaxOpenConns 默认值 = %d, want 30", cfg.Database.MaxOpenConns)
	}
	if cfg.Database.MaxIdleConns != 20 {
		t.Errorf("MaxIdleConns 默认值 = %d, want 20", cfg.Database.MaxIdleConns)
	}
	if got := cfg.Database.ConnMaxLifetime(); got != 30*time.Minute {
		t.Errorf("ConnMaxLifetime = %v, want 30m", got)
	}
	if got := cfg.Database.ConnMaxIdleTime(); got != 5*time.Minute {
		t.Errorf("ConnMaxIdleTime = %v, want 5m", got)
	}
}

func TestApplyDefaultsKeepsExplicitValues(t *testing.T) {
	cfg := &Config{
		Database: DatabaseConfig{
			MaxOpenConns:           50,
			MaxIdleConns:           40,
			ConnMaxLifetimeMinutes: 60,
			ConnMaxIdleTimeMinutes: 10,
		},
		Cache: CacheConfig{TTLSeconds: 120},
	}
	applyDefaults(cfg)

	if cfg.Database.MaxOpenConns != 50 || cfg.Database.MaxIdleConns != 40 {
		t.Errorf("显式连接池配置被覆盖: %+v", cfg.Database)
	}
	if got := cfg.Cache.CacheTTL(); got != 120*time.Second {
		t.Errorf("CacheTTL = %v, want 2m", got)
	}
}

func TestApplyDefaultsCapsIdleAtOpen(t *testing.T) {
	cfg := &Config{Database: DatabaseConfig{MaxOpenConns: 5, MaxIdleConns: 20}}
	applyDefaults(cfg)
	if cfg.Database.MaxIdleConns != 5 {
		t.Errorf("MaxIdleConns 不应超过 MaxOpenConns，得到 %d", cfg.Database.MaxIdleConns)
	}
}

func TestCacheTTLCanDisable(t *testing.T) {
	for _, ttl := range []int{0, -1} {
		cfg := CacheConfig{TTLSeconds: ttl}
		if got := cfg.CacheTTL(); got != 0 {
			t.Errorf("TTLSeconds=%d 表示关闭缓存，CacheTTL = %v", ttl, got)
		}
	}
}
