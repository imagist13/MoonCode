package article

import (
	"blog-backend/internal/domain/article"
	"context"
	"errors"

	"github.com/google/uuid"
)

var (
	ErrArticleNotFound = errors.New("文章不存在")
)

type ArticleService struct {
	repo article.Repository
}

func NewArticleService(repo article.Repository) *ArticleService {
	return &ArticleService{repo: repo}
}

type CreateCmd struct {
	Title       string
	Content     string
	Description string
	AuthorID    uint
	CategoryID  uint
	Status      int
}

type UpdateCmd struct {
	Title       string
	Content     string
	Description string
	CategoryID  uint
	Status      int
}

type ArticleDTO struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Slug        string `json:"slug"`
	Content     string `json:"content"`
	Description string `json:"description"`
	AuthorID    uint   `json:"author_id"`
	CategoryID  uint   `json:"category_id"`
	Status      int    `json:"status"`
	ViewCount   int    `json:"view_count"`
	Likes       int    `json:"likes"`
}

func (s *ArticleService) Create(ctx context.Context, cmd *CreateCmd) (*ArticleDTO, error) {
	a := &article.Article{
		Title:       cmd.Title,
		Slug:        uuid.New().String(),
		Content:     cmd.Content,
		Description: cmd.Description,
		AuthorID:    cmd.AuthorID,
		CategoryID:  cmd.CategoryID,
		Status:      cmd.Status,
	}

	if err := s.repo.Create(ctx, a); err != nil {
		return nil, err
	}

	return toDTO(a), nil
}

func (s *ArticleService) GetByID(ctx context.Context, id uint) (*ArticleDTO, error) {
	a, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrArticleNotFound
	}

	return toDTO(a), nil
}

func (s *ArticleService) GetBySlug(ctx context.Context, slug string) (*ArticleDTO, error) {
	a, err := s.repo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, ErrArticleNotFound
	}

	return toDTO(a), nil
}

func (s *ArticleService) Update(ctx context.Context, id uint, cmd *UpdateCmd) (*ArticleDTO, error) {
	a, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrArticleNotFound
	}

	if cmd.Title != "" {
		a.Title = cmd.Title
	}
	if cmd.Content != "" {
		a.Content = cmd.Content
	}
	if cmd.Description != "" {
		a.Description = cmd.Description
	}
	a.CategoryID = cmd.CategoryID
	a.Status = cmd.Status

	if err := s.repo.Update(ctx, a); err != nil {
		return nil, err
	}

	return toDTO(a), nil
}

func (s *ArticleService) Delete(ctx context.Context, id uint) error {
	_, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return ErrArticleNotFound
	}

	return s.repo.Delete(ctx, id)
}

func (s *ArticleService) List(ctx context.Context, page, pageSize int, categoryID *uint, status *int) ([]*ArticleDTO, int64, error) {
	articles, total, err := s.repo.List(ctx, page, pageSize, categoryID, status)
	if err != nil {
		return nil, 0, err
	}

	dtos := make([]*ArticleDTO, 0, len(articles))
	for _, a := range articles {
		dtos = append(dtos, toDTO(a))
	}

	return dtos, total, nil
}

func (s *ArticleService) IncreaseViewCount(ctx context.Context, id uint) error {
	return s.repo.IncreaseViewCount(ctx, id)
}

func (s *ArticleService) IncreaseLikes(ctx context.Context, id uint) error {
	return s.repo.IncreaseLikes(ctx, id)
}

func toDTO(a *article.Article) *ArticleDTO {
	return &ArticleDTO{
		ID:          a.ID,
		Title:       a.Title,
		Slug:        a.Slug,
		Content:     a.Content,
		Description: a.Description,
		AuthorID:    a.AuthorID,
		CategoryID:  a.CategoryID,
		Status:      a.Status,
		ViewCount:   a.ViewCount,
		Likes:       a.Likes,
	}
}