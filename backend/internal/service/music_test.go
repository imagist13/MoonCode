package service

import (
	"context"
	"errors"
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"

	"github.com/tajiaoyezi/blog-go-next/backend/internal/model"
)

func newMusicTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err := db.AutoMigrate(&model.Music{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	return db
}

// TestListEnabled_FiltersAndOrders 前台只返回启用曲目，并按 sort 升序。
func TestListEnabled_FiltersAndOrders(t *testing.T) {
	db := newMusicTestDB(t)
	svc := NewMusicService(db)
	ctx := context.Background()

	seed := []model.Music{
		{MusicName: "后放的歌", MusicUrl: "/uploads/c.mp3", Sort: 20, Status: 1},
		{MusicName: "先放的歌", MusicUrl: "/uploads/a.mp3", Sort: 10, Status: 1},
		{MusicName: "停用的歌", MusicUrl: "/uploads/b.mp3", Sort: 1, Status: 0},
	}
	for i := range seed {
		if err := db.Create(&seed[i]).Error; err != nil {
			t.Fatalf("seed music: %v", err)
		}
	}

	got, err := svc.ListEnabled(ctx)
	if err != nil {
		t.Fatalf("ListEnabled: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("期望 2 首启用曲目，实际 %d", len(got))
	}
	if got[0].MusicName != "先放的歌" || got[1].MusicName != "后放的歌" {
		t.Errorf("排序错误: got %q, %q", got[0].MusicName, got[1].MusicName)
	}
}

// TestSaveOrUpdate_TrimsAndValidates 必填校验与首尾空白清理。
func TestSaveOrUpdate_TrimsAndValidates(t *testing.T) {
	db := newMusicTestDB(t)
	svc := NewMusicService(db)
	ctx := context.Background()

	if err := svc.SaveOrUpdate(ctx, &model.Music{MusicUrl: "/uploads/a.mp3"}); !errors.Is(err, ErrMusicNameRequired) {
		t.Fatalf("缺少名称时应返回 ErrMusicNameRequired，实际 %v", err)
	}
	if err := svc.SaveOrUpdate(ctx, &model.Music{MusicName: "歌"}); !errors.Is(err, ErrMusicURLRequired) {
		t.Fatalf("缺少地址时应返回 ErrMusicURLRequired，实际 %v", err)
	}

	music := model.Music{
		MusicName:   "  夜航  ",
		MusicAuthor: " Moon ",
		MusicUrl:    " /uploads/a.mp3 ",
		Cover:       " /uploads/a.png ",
		Status:      1,
	}
	if err := svc.SaveOrUpdate(ctx, &music); err != nil {
		t.Fatalf("SaveOrUpdate: %v", err)
	}
	if music.ID == 0 {
		t.Fatal("创建后应回填 ID")
	}
	if music.MusicName != "夜航" || music.MusicAuthor != "Moon" ||
		music.MusicUrl != "/uploads/a.mp3" || music.Cover != "/uploads/a.png" {
		t.Errorf("字段未清理空白: %+v", music)
	}
}

// TestSaveOrUpdate_UpdateAndDelete 编辑后能读回，删除后后台列表为空。
func TestSaveOrUpdate_UpdateAndDelete(t *testing.T) {
	db := newMusicTestDB(t)
	svc := NewMusicService(db)
	ctx := context.Background()

	music := model.Music{MusicName: "旧名", MusicUrl: "/uploads/a.mp3", Status: 1}
	if err := svc.SaveOrUpdate(ctx, &music); err != nil {
		t.Fatalf("create: %v", err)
	}

	music.MusicName = "新名"
	music.Status = 0
	music.Sort = 5
	if err := svc.SaveOrUpdate(ctx, &music); err != nil {
		t.Fatalf("update: %v", err)
	}

	page, err := svc.ListAdmin(ctx, 1, 10, "")
	if err != nil {
		t.Fatalf("ListAdmin: %v", err)
	}
	if page.Count != 1 || page.Records[0].MusicName != "新名" || page.Records[0].Status != 0 {
		t.Fatalf("更新未生效: %+v", page.Records)
	}

	if err := svc.Delete(ctx, []int{music.ID}); err != nil {
		t.Fatalf("Delete: %v", err)
	}
	page, err = svc.ListAdmin(ctx, 1, 10, "")
	if err != nil {
		t.Fatalf("ListAdmin after delete: %v", err)
	}
	if page.Count != 0 {
		t.Fatalf("删除后应无记录，实际 %d", page.Count)
	}
}

// TestListAdmin_Keyword 按歌名/作者搜索。
func TestListAdmin_Keyword(t *testing.T) {
	db := newMusicTestDB(t)
	svc := NewMusicService(db)
	ctx := context.Background()

	seed := []model.Music{
		{MusicName: "夜航西飞", MusicAuthor: "Moon", MusicUrl: "/uploads/a.mp3", Status: 1},
		{MusicName: "城市的雨", MusicAuthor: "叶子", MusicUrl: "/uploads/b.mp3", Status: 1},
	}
	for i := range seed {
		if err := db.Create(&seed[i]).Error; err != nil {
			t.Fatalf("seed: %v", err)
		}
	}

	page, err := svc.ListAdmin(ctx, 1, 10, "Moon")
	if err != nil {
		t.Fatalf("ListAdmin: %v", err)
	}
	if page.Count != 1 || page.Records[0].MusicName != "夜航西飞" {
		t.Fatalf("按作者搜索失败: %+v", page.Records)
	}
}
