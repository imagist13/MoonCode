package persistence

import (
	"blog-backend/internal/domain/tag"
	"blog-backend/pkg/database"
	"context"

	"gorm.io/gorm"
)

type TagRepository struct {
	db *gorm.DB
}

func NewTagRepository() *TagRepository {
	return &TagRepository{db: database.GetDB()}
}

func (r *TagRepository) Create(ctx context.Context, t *tag.Tag) error {
	return r.db.WithContext(ctx).Create(t).Error
}

func (r *TagRepository) FindByID(ctx context.Context, id uint) (*tag.Tag, error) {
	var t tag.Tag
	if err := r.db.WithContext(ctx).First(&t, id).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TagRepository) FindByName(ctx context.Context, name string) (*tag.Tag, error) {
	var t tag.Tag
	if err := r.db.WithContext(ctx).Where("name = ?", name).First(&t).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TagRepository) FindBySlug(ctx context.Context, slug string) (*tag.Tag, error) {
	var t tag.Tag
	if err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&t).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TagRepository) Update(ctx context.Context, t *tag.Tag) error {
	return r.db.WithContext(ctx).Save(t).Error
}

func (r *TagRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&tag.Tag{}, id).Error
}

func (r *TagRepository) List(ctx context.Context, page, pageSize int) ([]*tag.Tag, int64, error) {
	var tags []*tag.Tag
	var total int64
	offset := (page - 1) * pageSize

	if err := r.db.WithContext(ctx).Model(&tag.Tag{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.WithContext(ctx).Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&tags).Error; err != nil {
		return nil, 0, err
	}

	return tags, total, nil
}

var _ tag.Repository = (*TagRepository)(nil)
