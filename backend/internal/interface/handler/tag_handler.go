package handler

import (
	"blog-backend/internal/application/tag"
	"blog-backend/internal/infrastructure/middleware"
	"blog-backend/internal/infrastructure/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TagHandler struct {
	service *tag.TagService
}

func NewTagHandler(service *tag.TagService) *TagHandler {
	return &TagHandler{service: service}
}

func (h *TagHandler) Create(c *gin.Context) {
	var cmd tag.CreateCmd
	if err := c.ShouldBindJSON(&cmd); err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	dto, err := h.service.Create(c.Request.Context(), &cmd)
	if err != nil {
		if err == tag.ErrTagExists {
			response.Error(c, 400, "标签已存在")
			return
		}
		response.Error(c, 500, "创建失败")
		return
	}

	response.Success(c, dto)
}

func (h *TagHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	dto, err := h.service.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		response.Error(c, 404, "标签不存在")
		return
	}

	response.Success(c, dto)
}

func (h *TagHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	dto, err := h.service.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		response.Error(c, 404, "标签不存在")
		return
	}

	response.Success(c, dto)
}

func (h *TagHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	var cmd tag.UpdateCmd
	if err := c.ShouldBindJSON(&cmd); err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	dto, err := h.service.Update(c.Request.Context(), uint(id), &cmd)
	if err != nil {
		response.Error(c, 404, "标签不存在")
		return
	}

	response.Success(c, dto)
}

func (h *TagHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	if err := h.service.Delete(c.Request.Context(), uint(id)); err != nil {
		response.Error(c, 404, "标签不存在")
		return
	}

	response.Success(c, nil)
}

func (h *TagHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	dtos, total, err := h.service.List(c.Request.Context(), page, pageSize)
	if err != nil {
		response.Error(c, 500, "获取标签列表失败")
		return
	}

	response.Success(c, gin.H{
		"list":  dtos,
		"total": total,
	})
}

func (h *TagHandler) Routes(r *gin.RouterGroup) {
	r.POST("/", middleware.AuthMiddleware(), h.Create)
	r.GET("/", h.List)
	r.GET("/:id", h.GetByID)
	r.GET("/slug/:slug", h.GetBySlug)
	r.PUT("/:id", middleware.AuthMiddleware(), h.Update)
	r.DELETE("/:id", middleware.AuthMiddleware(), h.Delete)
}
