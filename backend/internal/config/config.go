package config

import (
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/spf13/viper"
)

// Config 应用全局配置
type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	RabbitMQ RabbitMQConfig `mapstructure:"rabbitmq"`
	ES       ESConfig       `mapstructure:"elasticsearch"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Mail     MailConfig     `mapstructure:"mail"`
	Upload   UploadConfig   `mapstructure:"upload"`
	Cache    CacheConfig    `mapstructure:"cache"`
}

type ServerConfig struct {
	Port string `mapstructure:"port"`
	Mode string `mapstructure:"mode"` // debug / release / test
	// AllowedOrigins WebSocket / CORS 允许的 Origin 白名单（精确匹配）。
	// release 模式为空时拒绝所有跨域请求；debug 模式为空时放行（便于本地开发）。
	AllowedOrigins []string `mapstructure:"allowed_origins"`
}

type DatabaseConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
	SSLMode  string `mapstructure:"sslmode"`

	// 连接池参数。低并发下 database/sql 默认只保留 2 个空闲连接，
	// 流量起伏时会反复建连/断连（压测中表现为 P50 抖动）。
	// 通过显式配置让空闲连接数与通常并发量匹配。
	MaxOpenConns           int `mapstructure:"max_open_conns"`
	MaxIdleConns           int `mapstructure:"max_idle_conns"`
	ConnMaxLifetimeMinutes int `mapstructure:"conn_max_lifetime_minutes"`
	ConnMaxIdleTimeMinutes int `mapstructure:"conn_max_idle_time_minutes"`
}

// CacheConfig 公开读接口的 Redis 响应缓存
type CacheConfig struct {
	// TTLSeconds 缓存有效期（秒）；<= 0 表示关闭缓存。
	TTLSeconds int `mapstructure:"ttl_seconds"`
}

// DSN 返回 PostgreSQL 连接字符串
func (d DatabaseConfig) DSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		d.Host, d.Port, d.User, d.Password, d.DBName, d.SSLMode)
}

type RedisConfig struct {
	Addr     string `mapstructure:"addr"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

type RabbitMQConfig struct {
	URL string `mapstructure:"url"` // amqp://user:pass@host:port/vhost
}

type ESConfig struct {
	Addresses []string `mapstructure:"addresses"`
}

type JWTConfig struct {
	Secret     string `mapstructure:"secret"`
	ExpireHour int    `mapstructure:"expire_hour"`
}

type MailConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
	From     string `mapstructure:"from"`
}

type UploadConfig struct {
	Mode      string `mapstructure:"mode"` // local / oss / cos
	LocalPath string `mapstructure:"local_path"`
	MaxSize   int64  `mapstructure:"max_size_mb"`
}

var AppConfig Config

// envBindings 列出需要显式 BindEnv 的关键配置路径。
// 显式绑定能保证在未提供 YAML 文件、完全用环境变量部署的场景下
// （例如 Kubernetes ConfigMap/Secret）配置也能被正确读取。
//
// 命名约定：与基础设施镜像（postgres / redis / rabbitmq）一致，
// 方便 docker compose / k8s 共享同一份 .env。
var envBindings = []string{
	"server.port",
	"server.mode",
	"server.allowed_origins",
	"database.host",
	"database.port",
	"database.user",
	"database.password",
	"database.dbname",
	"database.sslmode",
	"database.max_open_conns",
	"database.max_idle_conns",
	"database.conn_max_lifetime_minutes",
	"database.conn_max_idle_time_minutes",
	"redis.addr",
	"redis.password",
	"redis.db",
	"rabbitmq.url",
	"elasticsearch.addresses",
	"jwt.secret",
	"jwt.expire_hour",
	"mail.host",
	"mail.port",
	"mail.username",
	"mail.password",
	"mail.from",
	"upload.mode",
	"upload.local_path",
	"upload.max_size_mb",
	"cache.ttl_seconds",
}

// envAliases 把「基础设施镜像用的标准变量」映射到「viper 内部路径」。
// 多个 env 写入同一个 key 时 viper 按注册顺序后者覆盖前者，
// 所以一对多（HOST+PORT→addr）的关系不放在这里，改在 Load() 里合成。
var envAliases = []struct {
	envName string
	key     string
}{
	// 数据库：与 postgres 镜像共享 POSTGRES_*
	{"POSTGRES_HOST", "database.host"},
	{"POSTGRES_PORT", "database.port"},
	{"POSTGRES_USER", "database.user"},
	{"POSTGRES_PASSWORD", "database.password"},
	{"POSTGRES_DB", "database.dbname"},
	{"DATABASE_SSLMODE", "database.sslmode"},
	{"DATABASE_MAX_OPEN_CONNS", "database.max_open_conns"},
	{"DATABASE_MAX_IDLE_CONNS", "database.max_idle_conns"},
	{"DATABASE_CONN_MAX_LIFETIME_MINUTES", "database.conn_max_lifetime_minutes"},
	{"DATABASE_CONN_MAX_IDLE_TIME_MINUTES", "database.conn_max_idle_time_minutes"},
	// Redis：与 redis 镜像共享 REDIS_*（addr 由 host:port 在 Load 里合成）
	{"REDIS_PASSWORD", "redis.password"},
	{"REDIS_DB", "redis.db"},
	// RabbitMQ：完整 URL 直接走 RABBITMQ_URL；HOST/PORT/USER/PASSWORD 在 Load 里合成
	{"RABBITMQ_URL", "rabbitmq.url"},
	// JWT / Mail / Upload：与现有命名保持一致
	{"JWT_SECRET", "jwt.secret"},
	{"JWT_EXPIRE_HOUR", "jwt.expire_hour"},
	{"MAIL_HOST", "mail.host"},
	{"MAIL_PORT", "mail.port"},
	{"MAIL_USERNAME", "mail.username"},
	{"MAIL_PASSWORD", "mail.password"},
	{"MAIL_FROM", "mail.from"},
	{"UPLOAD_MODE", "upload.mode"},
	{"UPLOAD_LOCAL_PATH", "upload.local_path"},
	{"UPLOAD_MAX_SIZE_MB", "upload.max_size_mb"},
	{"CACHE_TTL_SECONDS", "cache.ttl_seconds"},
}

// Load 加载配置文件；配置文件不存在时不致命，退化为仅使用环境变量。
//
// 环境变量约定：
//   - 点号替换为下划线（server.port -> SERVER_PORT）
//   - 所有环境变量大小写敏感，建议统一大写
//   - 与基础设施镜像共享标准名（POSTGRES_* / REDIS_* / RABBITMQ_*），
//     让一份 .env 同时驱动 postgres / redis / rabbitmq / backend 四个服务
//
// 必填项：jwt.secret、database.host、database.user、database.dbname
func Load(path string) {
	viper.SetConfigFile(path)
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	// 显式 BindEnv 才能让 Unmarshal 感知到环境变量（AutomaticEnv 对 Unmarshal 有已知限制）
	for _, key := range envBindings {
		_ = viper.BindEnv(key)
	}
	// 基础设施标准变量名 → 内部 key 的别名注册
	for _, a := range envAliases {
		_ = viper.BindEnv(a.key, a.envName)
	}

	if err := viper.ReadInConfig(); err != nil {
		var notFound viper.ConfigFileNotFoundError
		// 文件不存在是允许的 —— 退化为仅使用环境变量
		if errors.As(err, &notFound) || strings.Contains(err.Error(), "no such file") {
			log.Printf("未找到配置文件 %s，使用环境变量加载配置", path)
		} else {
			log.Fatalf("读取配置文件失败: %v", err)
		}
	}

	// 缓存默认 30 秒；显式设置 CACHE_TTL_SECONDS=0 可关闭（0 有明确语义，故走 viper 默认值而非 applyDefaults）。
	viper.SetDefault("cache.ttl_seconds", 30)

	if err := viper.Unmarshal(&AppConfig); err != nil {
		log.Fatalf("解析配置文件失败: %v", err)
	}

	// 合成：HOST + PORT -> addr
	composeAddrFromHostPort(&AppConfig)
	// 合成：RabbitMQ HOST/PORT/USER/PASSWORD -> url（仅当 RABBITMQ_URL 未显式给出时）
	composeRabbitURL()
	// 合成：ELASTICSEARCH_URL -> addresses
	composeESAddresses()
	// 未显式配置时补齐数据库连接池默认值
	applyDefaults(&AppConfig)

	if err := validate(&AppConfig); err != nil {
		log.Fatalf("配置校验失败: %v", err)
	}

	log.Printf("配置加载完成，运行模式: %s", AppConfig.Server.Mode)
}

// composeAddrFromHostPort 如果 REDIS_ADDR 未设置但 REDIS_HOST 给出，则拼成 host:port
func composeAddrFromHostPort(_ *Config) {
	if AppConfig.Redis.Addr == "" {
		host := viper.GetString("REDIS_HOST")
		if host != "" {
			port := viper.GetString("REDIS_PORT")
			if port == "" {
				port = "6379"
			}
			AppConfig.Redis.Addr = host + ":" + port
		}
	}
}

// composeRabbitURL 如果 RABBITMQ_URL 未设置但 HOST/USER/PASSWORD 给出，则拼出 amqp:// URL
func composeRabbitURL() {
	if AppConfig.RabbitMQ.URL != "" {
		return
	}
	host := viper.GetString("RABBITMQ_HOST")
	user := viper.GetString("RABBITMQ_USER")
	if host == "" || user == "" {
		return
	}
	port := viper.GetString("RABBITMQ_PORT")
	if port == "" {
		port = "5672"
	}
	password := viper.GetString("RABBITMQ_PASSWORD")
	if password == "" {
		AppConfig.RabbitMQ.URL = fmt.Sprintf("amqp://%s@%s:%s/", user, host, port)
	} else {
		AppConfig.RabbitMQ.URL = fmt.Sprintf("amqp://%s:%s@%s:%s/", user, password, host, port)
	}
}

// composeESAddresses 如果 ELASTICSEARCH_URL 给出但 addresses 为空，注入到 addresses
func composeESAddresses() {
	if len(AppConfig.ES.Addresses) > 0 {
		return
	}
	if u := viper.GetString("ELASTICSEARCH_URL"); u != "" {
		AppConfig.ES.Addresses = []string{u}
	}
}

// applyDefaults 为可选配置补齐默认值。
//
// 连接池默认值按「单实例 + 中小流量」设定：PostgreSQL max_connections=100，
// 后端保留 30 个上限、常驻 20 个空闲连接，既能承接突发并发，
// 又不会与其他组件争抢连接。部署规模变化时通过环境变量调整即可。
func applyDefaults(cfg *Config) {
	db := &cfg.Database
	if db.MaxOpenConns <= 0 {
		db.MaxOpenConns = 30
	}
	if db.MaxIdleConns <= 0 {
		db.MaxIdleConns = 20
	}
	if db.MaxIdleConns > db.MaxOpenConns {
		db.MaxIdleConns = db.MaxOpenConns
	}
	if db.ConnMaxLifetimeMinutes <= 0 {
		db.ConnMaxLifetimeMinutes = 30
	}
	if db.ConnMaxIdleTimeMinutes <= 0 {
		db.ConnMaxIdleTimeMinutes = 5
	}
}

// ConnMaxLifetime 返回连接最长存活时间
func (d DatabaseConfig) ConnMaxLifetime() time.Duration {
	return time.Duration(d.ConnMaxLifetimeMinutes) * time.Minute
}

// ConnMaxIdleTime 返回连接最长空闲时间
func (d DatabaseConfig) ConnMaxIdleTime() time.Duration {
	return time.Duration(d.ConnMaxIdleTimeMinutes) * time.Minute
}

// CacheTTL 返回缓存有效期；<= 0 表示关闭缓存
func (c CacheConfig) CacheTTL() time.Duration {
	if c.TTLSeconds <= 0 {
		return 0
	}
	return time.Duration(c.TTLSeconds) * time.Second
}

// validate 检查必填配置。缺失时返回错误，由调用方决定是否 fatal。
func validate(cfg *Config) error {
	var missing []string
	if strings.TrimSpace(cfg.JWT.Secret) == "" {
		missing = append(missing, "jwt.secret (env: JWT_SECRET)")
	}
	if strings.TrimSpace(cfg.Database.Host) == "" {
		missing = append(missing, "database.host (env: POSTGRES_HOST)")
	}
	if strings.TrimSpace(cfg.Database.User) == "" {
		missing = append(missing, "database.user (env: POSTGRES_USER)")
	}
	if strings.TrimSpace(cfg.Database.DBName) == "" {
		missing = append(missing, "database.dbname (env: POSTGRES_DB)")
	}
	if len(missing) > 0 {
		return fmt.Errorf("以下必填配置缺失: %s", strings.Join(missing, ", "))
	}
	return nil
}
