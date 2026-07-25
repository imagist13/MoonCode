package category

import (
	"blog-backend/internal/domain/category"
	"context"
	"errors"
	"strings"
)

var (
	ErrCategoryNotFound = errors.New("分类不存在")
	ErrCategoryExists   = errors.New("分类已存在")
)

type CategoryService struct {
	repo category.Repository
}

func NewCategoryService(repo category.Repository) *CategoryService {
	return &CategoryService{repo: repo}
}

type CreateCmd struct {
	Name     string
	Slug     string
	ParentID *uint
	Sort     int
}

type UpdateCmd struct {
	Name     string
	Slug     string
	ParentID *uint
	Sort     int
}

type CategoryDTO struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	ParentID *uint  `json:"parent_id"`
	Sort     int    `json:"sort"`
}

func (s *CategoryService) Create(ctx context.Context, cmd *CreateCmd) (*CategoryDTO, error) {
	if cmd.Slug == "" {
		cmd.Slug = strings.ToLower(strings.ReplaceAll(cmd.Name, " ", "-"))
	}

	_, err := s.repo.FindByName(ctx, cmd.Name)
	if err == nil {
		return nil, ErrCategoryExists
	}

	_, err = s.repo.FindBySlug(ctx, cmd.Slug)
	if err == nil {
		return nil, ErrCategoryExists
	}

	c := &category.Category{
		Name:      cmd.Name,
		Slug:      cmd.Slug,
		ParentID:  cmd.ParentID,
		Sort:      cmd.Sort,
	}

	if err := s.repo.Create(ctx, c); err != nil {
		return nil, err
	}

	return toDTO(c), nil
}

func (s *CategoryService) GetByID(ctx context.Context, id uint) (*CategoryDTO, error) {
	c, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	return toDTO(c), nil
}

func (s *CategoryService) GetBySlug(ctx context.Context, slug string) (*CategoryDTO, error) {
	c, err := s.repo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	return toDTO(c), nil
}

func (s *CategoryService) Update(ctx context.Context, id uint, cmd *UpdateCmd) (*CategoryDTO, error) {
	c, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	if cmd.Name != "" {
		c.Name = cmd.Name
	}
	if cmd.Slug != "" {
		c.Slug = cmd.Slug
	}
	c.ParentID = cmd.ParentID
	c.Sort = cmd.Sort

	if err := s.repo.Update(ctx, c); err != nil {
		return nil, err
	}

	return toDTO(c), nil
}

func (s *CategoryService) Delete(ctx context.Context, id uint) error {
	_, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return ErrCategoryNotFound
	}

	return s.repo.Delete(ctx, id)
}

func (s *CategoryService) List(ctx context.Context, page, pageSize int, parentID *uint) ([]*CategoryDTO, int64, error) {
	categories, total, err := s.repo.List(ctx, page, pageSize, parentID)
	if err != nil {
		return nil, 0, err
	}

	dtos := make([]*CategoryDTO, 0, len(categories))
	for _, c := range categories {
		dtos = append(dtos, toDTO(c))
	}

	return dtos, total, nil
}

func toDTO(c *category.Category) *CategoryDTO {
	return &CategoryDTO{
		ID:       c.ID,
		Name:     c.Name,
		Slug:     c.Slug,
		ParentID: c.ParentID,
		Sort:     c.Sort,
	}
}