package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"gorm.io/gorm"

	"github.com/tajiaoyezi/blog-go-next/backend/internal/model"
	"github.com/tajiaoyezi/blog-go-next/backend/internal/repository"
)

const (
	defaultMusicPageSize = 10
	maxMusicPageSize     = 100
)

var (
	ErrMusicNameRequired = errors.New("请填写歌曲名称")
	ErrMusicURLRequired  = errors.New("请填写音乐地址")
)

type MusicService struct {
	repo *repository.BaseRepository[model.Music]
	db   *gorm.DB
}

func NewMusicService(db *gorm.DB) *MusicService {
	return &MusicService{
		repo: repository.NewBaseRepository[model.Music](db),
		db:   db,
	}
}

// ListEnabled 前台点唱机列表：仅启用曲目，按排序值升序。
func (s *MusicService) ListEnabled(ctx context.Context) ([]model.Music, error) {
	return s.repo.FindAll(ctx, func(db *gorm.DB) *gorm.DB {
		return db.Where("status = ?", 1).Order("sort ASC, id ASC")
	})
}

// ListAdmin 后台曲目列表（含停用曲目）。
func (s *MusicService) ListAdmin(ctx context.Context, page, size int, keyword string) (*repository.PageResult[model.Music], error) {
	if page <= 0 {
		page = 1
	}
	if size <= 0 {
		size = defaultMusicPageSize
	}
	if size > maxMusicPageSize {
		size = maxMusicPageSize
	}

	keyword = strings.TrimSpace(keyword)
	return s.repo.List(ctx, page, size, func(db *gorm.DB) *gorm.DB {
		if keyword != "" {
			like := "%" + keyword + "%"
			db = db.Where("music_name LIKE ? OR music_author LIKE ?", like, like)
		}
		return db.Order("sort ASC, id DESC")
	})
}

// SaveOrUpdate 新增或编辑曲目。ID 大于 0 时按 ID 更新。
func (s *MusicService) SaveOrUpdate(ctx context.Context, music *model.Music) error {
	music.MusicName = strings.TrimSpace(music.MusicName)
	music.MusicAuthor = strings.TrimSpace(music.MusicAuthor)
	music.MusicUrl = strings.TrimSpace(music.MusicUrl)
	music.Cover = strings.TrimSpace(music.Cover)

	if music.MusicName == "" {
		return ErrMusicNameRequired
	}
	if music.MusicUrl == "" {
		return ErrMusicURLRequired
	}
	if music.Status != 0 && music.Status != 1 {
		music.Status = 1
	}

	if music.ID > 0 {
		err := s.repo.Update(ctx, music.ID, map[string]interface{}{
			"music_name":   music.MusicName,
			"music_author": music.MusicAuthor,
			"music_url":    music.MusicUrl,
			"cover":        music.Cover,
			"sort":         music.Sort,
			"status":       music.Status,
		})
		if errors.Is(err, repository.ErrNotFound) {
			return fmt.Errorf("曲目不存在")
		}
		return err
	}
	return s.repo.Create(ctx, music)
}

// Delete 硬删除曲目（后台明确操作，不做软删除）。
func (s *MusicService) Delete(ctx context.Context, ids []int) error {
	if len(ids) == 0 {
		return nil
	}
	return s.repo.Delete(ctx, ids)
}
