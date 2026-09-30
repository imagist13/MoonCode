package service

import (
	"context"
	"encoding/json"
	"fmt"

	"gorm.io/gorm"

	"github.com/tajiaoyezi/blog-go-next/backend/internal/model"
)

// AboutService 个人信息（关于页内容）的读写服务。
//
// 单行表设计：整站只维护一份「关于我」。读路径在表为空时返回一份默认值，
// 写路径使用 upsert，保证无论管理员是首次保存还是后续编辑都写入第一行。
type AboutService struct {
	db *gorm.DB
}

func NewAboutService(db *gorm.DB) *AboutService {
	return &AboutService{db: db}
}

// defaultAbout 用于表为空时的占位默认值，避免前端在初次部署时拿到零值。
//
// 字段保持与 model.About 对齐；JSON 数组型字段返回合法空数组，
// 让前端无需做 null 兜底，直接遍历即可。
func defaultAbout() model.About {
	return model.About{
		Nickname:       "提子",
		Pronouns:       "he/him",
		Intro:          "🍊 Hi, I'm 提子. Learning full-stack development.",
		Subtitle:       "Hello World",
		AboutPoints:    "[{\"emoji\":\"🌱\",\"text\":\"热爱技术与开源，持续学习与实践\"}]",
		TechStack:      "[]",
		Achievements:   "[]",
		Avatar:         "",
		Banner:         "",
		Bio:            "",
		Email:          "",
		Website:        "",
		Github:         "",
		Followers:      0,
		Following:      0,
		BackendSkills:  "",
		FrontendSkills: "",
		OtherSkills:    "",
	}
}

// GetAbout 读取「关于我」配置；不存在时返回默认值而不报错，
// 让前端无需处理「首次部署无配置」的特殊分支。
func (s *AboutService) GetAbout(ctx context.Context) (*model.About, error) {
	var about model.About
	if err := s.db.WithContext(ctx).First(&about).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			def := defaultAbout()
			return &def, nil
		}
		return nil, fmt.Errorf("读取关于我配置失败: %w", err)
	}
	return &about, nil
}

// UpdateAbout 写入「关于我」配置（upsert 到首行）。
//
// 入参来自 handler 的请求体，前端在用户未填的 JSON 数组字段上传的是 "[]"，
// 这里做一次兜底校验：JSON 数组字段如果反序列化失败则强制为空数组，
// 避免数据库里残留非法 JSON 导致后续解析异常。
func (s *AboutService) UpdateAbout(ctx context.Context, in *model.About) error {
	if in == nil {
		return fmt.Errorf("请求体为空")
	}
	in.AboutPoints = normalizeJSONArray(in.AboutPoints)
	in.TechStack = normalizeJSONArray(in.TechStack)
	in.Achievements = normalizeJSONArray(in.Achievements)

	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var existing model.About
		err := tx.First(&existing).Error
		if err == gorm.ErrRecordNotFound {
			return tx.Create(in).Error
		}
		if err != nil {
			return fmt.Errorf("读取关于我配置失败: %w", err)
		}
		in.ID = existing.ID
		in.CreateTime = existing.CreateTime
		return tx.Save(in).Error
	})
}

// normalizeJSONArray 把 JSON 数组字符串校验/归一化为合法数组。
// 不是合法 JSON（或为空）时返回 "[]"，避免存储污染。
func normalizeJSONArray(raw string) string {
	raw = trimSpace(raw)
	if raw == "" {
		return "[]"
	}
	var probe interface{}
	if err := json.Unmarshal([]byte(raw), &probe); err != nil {
		return "[]"
	}
	if _, ok := probe.([]interface{}); !ok {
		return "[]"
	}
	return raw
}

func trimSpace(s string) string {
	start, end := 0, len(s)
	for start < end {
		c := s[start]
		if c != ' ' && c != '\n' && c != '\r' && c != '\t' {
			break
		}
		start++
	}
	for end > start {
		c := s[end-1]
		if c != ' ' && c != '\n' && c != '\r' && c != '\t' {
			break
		}
		end--
	}
	return s[start:end]
}