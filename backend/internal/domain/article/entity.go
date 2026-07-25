package article

import (
	"time"

	"gorm.io/gorm"
)

type Article struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	Slug        string         `gorm:"unique;size:100" json:"slug"`
	Content     string         `gorm:"type:text" json:"content"`
	Description string         `gorm:"size:500" json:"description"`
	AuthorID    uint           `json:"author_id"`
	CategoryID  uint           `json:"category_id"`
	Status      int            `gorm:"default:1" json:"status"`
	ViewCount   int            `gorm:"default:0" json:"view_count"`
	Likes       int            `gorm:"default:0" json:"likes"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
