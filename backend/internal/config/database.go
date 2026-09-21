package config

import (
	"log"
	"os"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/tajiaoyezi/blog-go-next/backend/internal/model"
)

var DB *gorm.DB

// InitDatabase 初始化数据库连接。
//
// 自动迁移的默认行为可通过环境变量 AUTO_MIGRATE_ON_STARTUP 控制：
//   - true（默认）：兼容本地/单副本部署，启动时尝试 AutoMigrate + 种子基础数据
//   - false       ：生产/多副本部署，改为在部署流水线中执行 `go run ./cmd/migrate`
//
// 管理员账号的创建不再在此处进行；请运维使用 `go run ./cmd/seed` 并显式注入
// SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD 环境变量完成首次初始化。
func InitDatabase() {
	var logLevel logger.LogLevel
	if AppConfig.Server.Mode == "debug" {
		logLevel = logger.Info
	} else {
		logLevel = logger.Warn
	}

	db, err := gorm.Open(postgres.Open(AppConfig.Database.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	if shouldAutoMigrate() {
		if err := model.AutoMigrate(db); err != nil {
			log.Fatalf("数据库迁移失败: %v", err)
		}
		// 仅在启动时自动迁移的场景下填充非敏感种子数据（角色 + 页面）。
		// 管理员账号必须通过 cmd/seed 手动创建，避免硬编码默认凭据。
		model.Seed(db)
	} else {
		log.Println("AUTO_MIGRATE_ON_STARTUP=false，跳过启动期迁移；请通过 cmd/migrate 执行")
	}

	// 检查是否已存在管理员账号；若缺失，打印一行醒目提示引导运维执行 ./seed。
	// 这是登录页 401 "用户名或密码错误" 时最常见的盲区：
	// 只跑过 migrate 而忘了 ./seed（或 seed 被旧的"表非空就跳过"逻辑静默跳过）。
	warnIfNoAdmin(db)

	DB = db
	log.Println("数据库初始化完成")
}

// warnIfNoAdmin 当 tb_user_role 中没有任何 role_id=1（管理员）绑定时，打印醒目的
// 单行警告。仅做提示，不阻断启动 —— 因为：
//   - 生产环境可能在等运维手工建管理员；
//   - 同一进程可能被多副本部署，其中一台做这一步检查即可。
func warnIfNoAdmin(db *gorm.DB) {
	if db == nil {
		return
	}
	var n int64
	if err := db.Model(&model.UserRole{}).Where("role_id = ?", 1).Count(&n).Error; err != nil {
		log.Printf("检查管理员角色失败（非致命）: %v", err)
		return
	}
	if n == 0 {
		log.Println("⚠️  未检测到任何管理员账号（tb_user_role.role_id=1 空）。" +
			"后台 /admin/login 将一律返回\"用户名或密码错误\"。" +
			"请执行：docker compose exec backend ./seed  （或在本地：go run ./cmd/seed），" +
			"并确保已设置 SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD。")
	}
}

// shouldAutoMigrate 解析 AUTO_MIGRATE_ON_STARTUP 环境变量，默认 true 以兼容现有部署。
func shouldAutoMigrate() bool {
	v := strings.ToLower(strings.TrimSpace(os.Getenv("AUTO_MIGRATE_ON_STARTUP")))
	if v == "" {
		return true
	}
	// 明确设置为 false/0/no 时跳过
	switch v {
	case "false", "0", "no", "off":
		return false
	default:
		return true
	}
}
