package article

import (
	"blog-backend/internal/domain/article"
	"context"
	"errors"
	"strings"
	"time"

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
	Cover       string
	AuthorID    uint
	CategoryID  uint
	TagIDs      []uint
	Status      int
}

type UpdateCmd struct {
	Title       string
	Content     string
	Description string
	Cover       string
	CategoryID  uint
	TagIDs      []uint
	Status      int
}

/**
 * 与前端 Article 类型对齐：
 *   summary        ← Description
 *   views          ← ViewCount
 *   likes          ← Likes
 *   updated_at     ← UpdatedAt (ISO)
 *   published_at   ← PublishedAt (ISO)
 *   created_at     ← CreatedAt (ISO)
 */
type ArticleDTO struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Summary     string    `json:"summary"`
	Content     string    `json:"content"`
	Cover       string    `json:"cover,omitempty"`
	AuthorID    uint      `json:"author_id"`
	CategoryID  uint      `json:"category_id"`
	Status      int       `json:"status"`
	Views       int       `json:"views"`
	ViewCount   int       `json:"view_count"`
	Likes       int       `json:"likes"`
	ReadingTime int       `json:"reading_time"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
}

func (s *ArticleService) Create(ctx context.Context, cmd *CreateCmd) (*ArticleDTO, error) {
	now := time.Now()
	a := &article.Article{
		Title:       cmd.Title,
		Slug:        uuid.New().String(),
		Content:     cmd.Content,
		Description: cmd.Description,
		Cover:       cmd.Cover,
		AuthorID:    cmd.AuthorID,
		CategoryID:  cmd.CategoryID,
		Status:      cmd.Status,
	}

	if cmd.Status == 1 {
		a.PublishedAt = &now
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
	if cmd.Cover != "" {
		a.Cover = cmd.Cover
	}
	a.CategoryID = cmd.CategoryID

	prevStatus := a.Status
	a.Status = cmd.Status

	// 状态从非发布变为发布时，记录首次发布时间。
	if prevStatus != 1 && cmd.Status == 1 && a.PublishedAt == nil {
		now := time.Now()
		a.PublishedAt = &now
	}
	// 从发布退回草稿时清空发布时间，避免前端误显示。
	if cmd.Status != 1 && a.PublishedAt != nil {
		a.PublishedAt = nil
	}

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

func (s *ArticleService) List(ctx context.Context, page, pageSize int, categoryID *uint, tagID *uint, keyword *string, status *int) ([]*ArticleDTO, int64, error) {
	articles, total, err := s.repo.List(ctx, page, pageSize, categoryID, tagID, keyword, status)
	if err != nil {
		return nil, 0, err
	}

	dtos := make([]*ArticleDTO, 0, len(articles))
	for _, a := range articles {
		dtos = append(dtos, toDTO(a))
	}

	return dtos, total, nil
}

func (s *ArticleService) ListSlugs(ctx context.Context) ([]string, error) {
	return s.repo.ListSlugs(ctx)
}

func (s *ArticleService) IncreaseViewCount(ctx context.Context, id uint) error {
	return s.repo.IncreaseViewCount(ctx, id)
}

func (s *ArticleService) IncreaseLikes(ctx context.Context, id uint) error {
	return s.repo.IncreaseLikes(ctx, id)
}

func toDTO(a *article.Article) *ArticleDTO {
	dto := &ArticleDTO{
		ID:          a.ID,
		Title:       a.Title,
		Slug:        a.Slug,
		Summary:     a.Description,
		Content:     a.Content,
		Cover:       a.Cover,
		AuthorID:    a.AuthorID,
		CategoryID:  a.CategoryID,
		Status:      a.Status,
		ViewCount:   a.ViewCount,
		Views:       a.ViewCount,
		Likes:       a.Likes,
		ReadingTime: estimateReadingTime(a.Content),
		CreatedAt:   a.CreatedAt,
		UpdatedAt:   a.UpdatedAt,
	}

	// 已发布且有 published_at 时返回真实发布时间；否则保留字段为零值由前端兜底。
	if a.Status == 1 && a.PublishedAt != nil {
		dto.PublishedAt = a.PublishedAt
	}

	return dto
}

/**
 * 极简估算阅读时长（按 350 字/分钟，向上取整，最低 1 分钟）。
 * 仅在 Content 非空时给出估算值。
 */
func estimateReadingTime(content string) int {
	chars := len(strings.TrimSpace(content))
	if chars == 0 {
		return 0
	}
	return (chars + 349) / 350
}