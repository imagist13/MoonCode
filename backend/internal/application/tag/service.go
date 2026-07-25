package tag

import (
	"blog-backend/internal/domain/tag"
	"context"
	"errors"
	"strings"
)

var (
	ErrTagNotFound = errors.New("标签不存在")
	ErrTagExists   = errors.New("标签已存在")
)

type TagService struct {
	repo tag.Repository
}

func NewTagService(repo tag.Repository) *TagService {
	return &TagService{repo: repo}
}

type CreateCmd struct {
	Name string
	Slug string
}

type UpdateCmd struct {
	Name string
	Slug string
}

type TagDTO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

func (s *TagService) Create(ctx context.Context, cmd *CreateCmd) (*TagDTO, error) {
	if cmd.Slug == "" {
		cmd.Slug = strings.ToLower(strings.ReplaceAll(cmd.Name, " ", "-"))
	}

	_, err := s.repo.FindByName(ctx, cmd.Name)
	if err == nil {
		return nil, ErrTagExists
	}

	_, err = s.repo.FindBySlug(ctx, cmd.Slug)
	if err == nil {
		return nil, ErrTagExists
	}

	t := &tag.Tag{
		Name: cmd.Name,
		Slug: cmd.Slug,
	}

	if err := s.repo.Create(ctx, t); err != nil {
		return nil, err
	}

	return toDTO(t), nil
}

func (s *TagService) GetByID(ctx context.Context, id uint) (*TagDTO, error) {
	t, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrTagNotFound
	}

	return toDTO(t), nil
}

func (s *TagService) GetBySlug(ctx context.Context, slug string) (*TagDTO, error) {
	t, err := s.repo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, ErrTagNotFound
	}

	return toDTO(t), nil
}

func (s *TagService) Update(ctx context.Context, id uint, cmd *UpdateCmd) (*TagDTO, error) {
	t, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrTagNotFound
	}

	if cmd.Name != "" {
		t.Name = cmd.Name
	}
	if cmd.Slug != "" {
		t.Slug = cmd.Slug
	}

	if err := s.repo.Update(ctx, t); err != nil {
		return nil, err
	}

	return toDTO(t), nil
}

func (s *TagService) Delete(ctx context.Context, id uint) error {
	_, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return ErrTagNotFound
	}

	return s.repo.Delete(ctx, id)
}

func (s *TagService) List(ctx context.Context, page, pageSize int) ([]*TagDTO, int64, error) {
	tags, total, err := s.repo.List(ctx, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	dtos := make([]*TagDTO, 0, len(tags))
	for _, t := range tags {
		dtos = append(dtos, toDTO(t))
	}

	return dtos, total, nil
}

func toDTO(t *tag.Tag) *TagDTO {
	return &TagDTO{
		ID:   t.ID,
		Name: t.Name,
		Slug: t.Slug,
	}
}