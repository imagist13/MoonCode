package persistence

import (
	"blog-backend/internal/domain/article"
	"blog-backend/pkg/database"
	"context"

	"gorm.io/gorm"
)

type ArticleRepository struct {
	db *gorm.DB
}

func NewArticleRepository() *ArticleRepository {
	return &ArticleRepository{db: database.GetDB()}
}

func (r *ArticleRepository) Create(ctx context.Context, a *article.Article) error {
	return r.db.WithContext(ctx).Create(a).Error
}

func (r *ArticleRepository) FindByID(ctx context.Context, id uint) (*article.Article, error) {
	var a article.Article
	if err := r.db.WithContext(ctx).First(&a, id).Error; err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *ArticleRepository) FindBySlug(ctx context.Context, slug string) (*article.Article, error) {
	var a article.Article
	if err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&a).Error; err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *ArticleRepository) Update(ctx context.Context, a *article.Article) error {
	return r.db.WithContext(ctx).Save(a).Error
}

func (r *ArticleRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&article.Article{}, id).Error
}

func (r *ArticleRepository) List(ctx context.Context, page, pageSize int, categoryID *uint, status *int) ([]*article.Article, int64, error) {
	var articles []*article.Article
	var total int64
	offset := (page - 1) * pageSize

	query := r.db.WithContext(ctx).Model(&article.Article{})

	if categoryID != nil {
		query = query.Where("category_id = ?", *categoryID)
	}

	if status != nil {
		query = query.Where("status = ?", *status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&articles).Error; err != nil {
		return nil, 0, err
	}

	return articles, total, nil
}

func (r *ArticleRepository) IncreaseViewCount(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Model(&article.Article{}).Where("id = ?", id).UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

func (r *ArticleRepository) IncreaseLikes(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Model(&article.Article{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes + 1")).Error
}

var _ article.Repository = (*ArticleRepository)(nil)