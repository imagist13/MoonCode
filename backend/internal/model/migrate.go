package model

import (
	"fmt"
	"log"

	"gorm.io/gorm"
)

// AllModels 所有需要自动迁移的模型
var AllModels = []interface{}{
	&UserAuth{},
	&UserInfo{},
	&UserRole{},
	&Role{},
	&Article{},
	&ArticleTag{},
	&Category{},
	&Tag{},
	&Comment{},
	&Talk{},
	&Message{},
	&ChatRecord{},
	&PhotoAlbum{},
	&Photo{},
	&Music{},
	&FriendLink{},
	&Menu{},
	&Resource{},
	&RoleMenu{},
	&RoleResource{},
	&Page{},
	&WebsiteConfig{},
	&OperationLog{},
	&UniqueView{},
	&About{},
}

// AutoMigrate 自动迁移所有表
func AutoMigrate(db *gorm.DB) error {
	if err := db.AutoMigrate(AllModels...); err != nil {
		return fmt.Errorf("数据库自动迁移失败: %w", err)
	}
	log.Printf("数据库迁移完成，共 %d 张表", len(AllModels))
	ensurePerformanceIndexes(db)
	return nil
}

// performanceIndexes 一组幂等的性能索引 DDL。
//
// 按线上实际查询的「过滤条件 + 排序」组合设计：
//   - 公开列表普遍带 is_delete / status / is_review 等低基数列，再按 id 倒序分页；
//   - 复合索引让「过滤 + 排序 + LIMIT」走同一条索引，避免额外排序和全表扫描。
//
// 之所以用显式 SQL 而非 GORM tag：需要 DESC 排序方向，且要保证
// 「索引已存在」时幂等（CREATE INDEX IF NOT EXISTS）。
var performanceIndexes = []struct {
	name string
	sql  string
}{
	{
		name: "idx_article_public_list",
		// 首页/后台文章列表：is_delete + status 等值过滤，is_top/id 双字段倒序分页
		sql: `CREATE INDEX IF NOT EXISTS idx_article_public_list
			ON tb_article (is_delete, status, is_top DESC, id DESC)`,
	},
	{
		name: "idx_article_public_archive",
		// 归档：等值过滤后按 id 倒序
		sql: `CREATE INDEX IF NOT EXISTS idx_article_public_archive
			ON tb_article (is_delete, status, id DESC)`,
	},
	{
		name: "idx_article_category_public",
		// 分类页 / 分类文章数统计：category_id 等值 + 公开状态过滤 + id 倒序
		sql: `CREATE INDEX IF NOT EXISTS idx_article_category_public
			ON tb_article (category_id, is_delete, status, id DESC)`,
	},
	{
		name: "idx_comment_public_list",
		// 公开评论：topic_id/type/is_delete/is_review 过滤，parent_id 分组，id 排序
		sql: `CREATE INDEX IF NOT EXISTS idx_comment_public_list
			ON tb_comment (topic_id, type, is_delete, is_review, parent_id, id)`,
	},
	{
		name: "idx_message_review_list",
		// 公开留言：is_review 等值 + id 倒序分页
		sql: `CREATE INDEX IF NOT EXISTS idx_message_review_list
			ON tb_message (is_review, id DESC)`,
	},
	{
		name: "idx_talk_public_list",
		// 公开说说：status 等值 + is_top/id 倒序分页
		sql: `CREATE INDEX IF NOT EXISTS idx_talk_public_list
			ON tb_talk (status, is_top DESC, id DESC)`,
	},
}

// ensurePerformanceIndexes 创建性能索引。
//
// 仅 PostgreSQL 执行：索引 DDL 与布尔列排序方向在其他方言（本地测试用 SQLite）不完全兼容。
// 索引属于纯性能优化，创建失败只告警不阻断迁移/启动——避免因权限或锁等待
// 让一次正常的发布会失败。
func ensurePerformanceIndexes(db *gorm.DB) {
	if db.Dialector.Name() != "postgres" {
		return
	}
	for _, idx := range performanceIndexes {
		if err := db.Exec(idx.sql).Error; err != nil {
			log.Printf("创建性能索引 %s 失败（非致命）: %v", idx.name, err)
			continue
		}
	}
	log.Printf("性能索引检查完成，共 %d 条", len(performanceIndexes))
}
