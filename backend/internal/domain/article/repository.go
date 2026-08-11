package article

import (
	"context"
)

type Repository interface {
	Create(ctx context.Context, article *Article) error
	FindByID(ctx context.Context, id uint) (*Article, error)
	FindBySlug(ctx context.Context, slug string) (*Article, error)
	ListSlugs(ctx context.Context) ([]string, error)
	Update(ctx context.Context, article *Article) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, page, pageSize int, categoryID *uint, tagID *uint, keyword *string, status *int) ([]*Article, int64, error)
	IncreaseViewCount(ctx context.Context, id uint) error
	IncreaseLikes(ctx context.Context, id uint) error
}