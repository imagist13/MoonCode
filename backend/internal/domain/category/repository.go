package category

import (
	"context"
)

type Repository interface {
	Create(ctx context.Context, category *Category) error
	FindByID(ctx context.Context, id uint) (*Category, error)
	FindByName(ctx context.Context, name string) (*Category, error)
	FindBySlug(ctx context.Context, slug string) (*Category, error)
	Update(ctx context.Context, category *Category) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, page, pageSize int, parentID *uint) ([]*Category, int64, error)
}
