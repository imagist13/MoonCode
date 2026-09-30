package handler

import (
	"github.com/gin-gonic/gin"

	"github.com/tajiaoyezi/blog-go-next/backend/internal/model"
	"github.com/tajiaoyezi/blog-go-next/backend/internal/service"
)

// AboutHandler 「关于我」接口处理器。
//
// 拆分自 BlogInfoHandler 是因为「关于我」是结构化数据（多字段），
// 与旧版 BlogInfoHandler.UpdateAbout 把整段 markdown 当字符串塞进
// WebsiteConfig.config JSON 的设计不同——新设计把整张表独立出来，
// 用专门的字段表达每个语义单元。
type AboutHandler struct {
	svc *service.AboutService
}

func NewAboutHandler(svc *service.AboutService) *AboutHandler {
	return &AboutHandler{svc: svc}
}

// GetAbout 公开接口，返回当前「关于我」配置（不存在时返回默认值）
func (h *AboutHandler) GetAbout(c *gin.Context) {
	about, err := h.svc.GetAbout(c.Request.Context())
	if err != nil {
		FailServer(c, err.Error())
		return
	}
	OK(c, about)
}

// UpdateAbout 管理员更新「关于我」配置。
//
// 注意：直接绑定 model.About 结构体——gin 会忽略空字段的非零校验，
// 允许部分字段更新。但 ID/CreateTime/UpdateTime 这类字段会暴露在请求里，
// 因此 handler 在写库前由 service 重置 ID/CreateTime，避免越权覆盖。
func (h *AboutHandler) UpdateAbout(c *gin.Context) {
	var req model.About
	if err := c.ShouldBindJSON(&req); err != nil {
		FailValidation(c, "请求格式错误")
		return
	}
	// 防止前端意外把空字符串当成"清空昵称"
	if req.Nickname == "" {
		FailValidation(c, "昵称不能为空")
		return
	}
	if err := h.svc.UpdateAbout(c.Request.Context(), &req); err != nil {
		FailServer(c, err.Error())
		return
	}
	OK(c, nil)
}