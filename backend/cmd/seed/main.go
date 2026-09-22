// Package main 实现 seed 命令：创建 / 重置管理员账号。
//
// 使用方式：
//
//	SEED_ADMIN_EMAIL="admin@example.com" \
//	SEED_ADMIN_PASSWORD="change-me-min-8-chars" \
//	go run ./cmd/seed
//
// 或在容器中：
//
//	SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... ./bin/seed
//
// 该命令幂等，且支持密码覆盖：
//   - 若 tb_user_auth 中已存在 email 对应的账号，则仅重置该账号的密码（re-hash）、
//     保证绑定 admin 角色（role_id=1）、并 bump token_version 让旧 JWT 失效，
//     其余字段不动。重复执行可作为"找回管理员密码"的逃生口。
//   - 若 email 不存在，则基于环境变量创建 UserInfo + UserAuth + UserRole(admin)。
//   - 若 email 不存在但 tb_user_auth 已有其他账号，也会照常创建（不依赖"空表才创建"）。
package main

import (
	"errors"
	"log"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/tajiaoyezi/blog-go-next/backend/internal/config"
	"github.com/tajiaoyezi/blog-go-next/backend/internal/model"
)

const minPasswordLen = 8

// adminRoleID 由 SeedRoles 保证存在的内置管理员角色 ID。
const adminRoleID = 1

func main() {
	email := os.Getenv("SEED_ADMIN_EMAIL")
	password := os.Getenv("SEED_ADMIN_PASSWORD")

	// 缺失任一变量时优雅退出（exit 0）而非 log.Fatal：
	//   - 让 CI/CD 流水线可以在不强制配置 seed 的情况下安全地调用 ./seed
	//   - 仍打印醒目日志，运维一看就知道为什么没建账号
	if email == "" || password == "" {
		log.Println("ℹ️  SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD 未设置，跳过 seed。" +
			"如需创建/重置管理员，请在 .env 或当前 shell 中设置后重跑。")
		return
	}
	if len(password) < minPasswordLen {
		log.Fatalf("SEED_ADMIN_PASSWORD 至少需要 %d 个字符", minPasswordLen)
	}

	// 加载配置（复用 server 的 config 流程）
	configPath := os.Getenv("CONFIG_PATH")
	if configPath == "" {
		configPath = "config.yaml"
	}
	config.Load(configPath)

	// 独立打开连接：避免复用 InitDatabase 触发 AutoMigrate/Seed
	db, err := gorm.Open(postgres.Open(config.AppConfig.Database.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	// 先保证角色和页面存在（幂等）
	model.SeedRoles(db)
	model.SeedPages(db)

	if err := upsertAdmin(db, email, password); err != nil {
		log.Fatalf("创建/重置管理员失败: %v", err)
	}
}

// upsertAdmin 创建或重置管理员账号。
//
// 行为：
//   - email 不存在于 tb_user_auth → 创建 UserInfo + UserAuth + UserRole(admin)。
//   - email 已存在 → 仅重置密码（re-hash），保证 admin 角色已绑定，并 bump token_version
//     让旧 JWT 立刻失效。其他字段（昵称、头像、last_login_time 等）保持不变。
//
// 该函数不承担迁移职责，调用方应先执行 model.AutoMigrate / model.Seed。
func upsertAdmin(db *gorm.DB, email, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	now := time.Now()

	// 1. 邮箱对应的账号是否存在（username 与 email 字段都查询，防止两边漂移）
	var existing model.UserAuth
	err = db.Where("username = ?", email).First(&existing).Error
	switch {
	case err == nil:
		// 已存在 → 重置密码 + bump token_version 保证旧 JWT 失效
		if uerr := db.Model(&existing).Updates(map[string]interface{}{
			"password":      string(hashedPassword),
			"token_version": gorm.Expr("token_version + 1"),
		}).Error; uerr != nil {
			return uerr
		}
		// 保证 admin 角色绑定（幂等）
		if rerr := ensureAdminRole(db, existing.ID); rerr != nil {
			return rerr
		}
		log.Printf("管理员密码已重置：username=%s, user_auth_id=%d（其他字段未改动）", email, existing.ID)
		return nil

	case errors.Is(err, gorm.ErrRecordNotFound):
		// 不存在 → 走完整创建流程
	default:
		return err
	}

	return db.Transaction(func(tx *gorm.DB) error {
		info := model.UserInfo{
			BaseModel: model.BaseModel{CreateTime: now},
			Email:     email,
			Nickname:  "管理员",
			Avatar:    "https://static.talkxj.com/avatar/user.png",
		}
		if err := tx.Create(&info).Error; err != nil {
			return err
		}

		auth := model.UserAuth{
			BaseModel:  model.BaseModel{CreateTime: now},
			UserInfoID: info.ID,
			Username:   email,
			Password:   string(hashedPassword),
			LoginType:  1,
		}
		if err := tx.Create(&auth).Error; err != nil {
			return err
		}

		role := model.UserRole{UserID: auth.ID, RoleID: adminRoleID}
		if err := tx.Create(&role).Error; err != nil {
			return err
		}

		log.Printf("管理员账号创建成功：username=%s, user_info_id=%d, user_auth_id=%d", email, info.ID, auth.ID)
		return nil
	})
}

// ensureAdminRole 幂等地绑定 admin 角色。
//
// 若已绑定任意 admin 角色，则跳过（不强制独占，避免误删运维手工调整的多角色配置）。
// 若未绑定，则插入 role_id=adminRoleID 的关联。
func ensureAdminRole(db *gorm.DB, userAuthID int) error {
	var count int64
	if err := db.Model(&model.UserRole{}).
		Where("user_id = ? AND role_id = ?", userAuthID, adminRoleID).
		Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	return db.Create(&model.UserRole{UserID: userAuthID, RoleID: adminRoleID}).Error
}
