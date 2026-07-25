package persistence

import (
	"blog-backend/internal/domain/category"
	"blog-backend/pkg/database"
	"context"

	"gorm.io/gorm"
)

type CategoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository() *CategoryRepository {
	return &CategoryRepository{db: database.GetDB()}
}

func (r *CategoryRepository) Create(ctx context.Context, c *category.Category) error {
	return r.db.WithContext(ctx).Create(c).Error
}

func (r *CategoryRepository) FindByID(ctx context.Context, id uint) (*category.Category, error) {
	var c category.Category
	if err := r.db.WithContext(ctx).First(&c, id).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CategoryRepository) FindByName(ctx context.Context, name string) (*category.Category, error) {
	var c category.Category
	if err := r.db.WithContext(ctx).Where("name = ?", name).First(&c).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CategoryRepository) FindBySlug(ctx context.Context, slug string) (*category.Category, error) {
	var c category.Category
	if err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&c).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CategoryRepository) Update(ctx context.Context, c *category.Category) error {
	return r.db.WithContext(ctx).Save(c).Error
}

func (r *CategoryRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&category.Category{}, id).Error
}

func (r *CategoryRepository) List(ctx context.Context, page, pageSize int, parentID *uint) ([]*category.Category, int64, error) {
	var categories []*category.Category
	var total int64
	offset := (page - 1) * pageSize

	query := r.db.WithContext(ctx).Model(&category.Category{})

	if parentID != nil {
		query = query.Where("parent_id = ?", *parentID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset(offset).Limit(pageSize).Order("sort ASC, created_at DESC").Find(&categories).Error; err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

var _ category.Repository = (*CategoryRepository)(nil)
