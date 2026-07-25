package tag

import (
	"context"
)

type Repository interface {
	Create(ctx context.Context, tag *Tag) error
	FindByID(ctx context.Context, id uint) (*Tag, error)
	FindByName(ctx context.Context, name string) (*Tag, error)
	FindBySlug(ctx context.Context, slug string) (*Tag, error)
	Update(ctx context.Context, tag *Tag) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, page, pageSize int) ([]*Tag, int64, error)
}
