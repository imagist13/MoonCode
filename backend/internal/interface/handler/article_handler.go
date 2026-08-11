package handler

import (
	"blog-backend/internal/application/article"
	"blog-backend/internal/infrastructure/middleware"
	"blog-backend/internal/infrastructure/response"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type ArticleHandler struct {
	service *article.ArticleService
}

func NewArticleHandler(service *article.ArticleService) *ArticleHandler {
	return &ArticleHandler{service: service}
}

func (h *ArticleHandler) Create(c *gin.Context) {
	var cmd article.CreateCmd
	if err := c.ShouldBindJSON(&cmd); err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	cmd.AuthorID = c.GetUint("user_id")
	dto, err := h.service.Create(c.Request.Context(), &cmd)
	if err != nil {
		response.Error(c, 500, "创建失败")
		return
	}

	response.Success(c, dto)
}

func (h *ArticleHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	dto, err := h.service.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		response.Error(c, 404, "文章不存在")
		return
	}

	h.service.IncreaseViewCount(c.Request.Context(), uint(id))
	response.Success(c, dto)
}

func (h *ArticleHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	dto, err := h.service.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		response.Error(c, 404, "文章不存在")
		return
	}

	h.service.IncreaseViewCount(c.Request.Context(), dto.ID)
	response.Success(c, dto)
}

func (h *ArticleHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	var cmd article.UpdateCmd
	if err := c.ShouldBindJSON(&cmd); err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	dto, err := h.service.Update(c.Request.Context(), uint(id), &cmd)
	if err != nil {
		response.Error(c, 404, "文章不存在")
		return
	}

	response.Success(c, dto)
}

func (h *ArticleHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	if err := h.service.Delete(c.Request.Context(), uint(id)); err != nil {
		response.Error(c, 404, "文章不存在")
		return
	}

	response.Success(c, nil)
}

func (h *ArticleHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	var categoryID *uint
	if catID := c.Query("category_id"); catID != "" {
		id, err := strconv.ParseUint(catID, 10, 64)
		if err == nil {
			cid := uint(id)
			categoryID = &cid
		}
	}

	var tagID *uint
	if t := c.Query("tag_id"); t != "" {
		id, err := strconv.ParseUint(t, 10, 64)
		if err == nil {
			tid := uint(id)
			tagID = &tid
		}
	}

	var status *int
	if s := c.Query("status"); s != "" {
		st, err := strconv.Atoi(s)
		if err == nil {
			status = &st
		}
	}

	var keyword *string
	if k := strings.TrimSpace(c.Query("keyword")); k != "" {
		keyword = &k
	}

	dtos, total, err := h.service.List(c.Request.Context(), page, pageSize, categoryID, tagID, keyword, status)
	if err != nil {
		response.Error(c, 500, "获取文章列表失败")
		return
	}

	response.Success(c, gin.H{
		"list":  dtos,
		"total": total,
	})
}

/** 返回已发布文章的 slug 列表，供前端 ISR generateStaticParams。 */
func (h *ArticleHandler) Slugs(c *gin.Context) {
	slugs, err := h.service.ListSlugs(c.Request.Context())
	if err != nil {
		response.Error(c, 500, "获取 slug 列表失败")
		return
	}
	response.Success(c, slugs)
}

func (h *ArticleHandler) Like(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	if err := h.service.IncreaseLikes(c.Request.Context(), uint(id)); err != nil {
		response.Error(c, 500, "操作失败")
		return
	}

	response.Success(c, nil)
}

func (h *ArticleHandler) Routes(r *gin.RouterGroup) {
	r.POST("/", middleware.AuthMiddleware(), h.Create)
	r.GET("/", h.List)
	r.GET("/slugs", h.Slugs)
	r.GET("/:id", h.GetByID)
	r.GET("/slug/:slug", h.GetBySlug)
	r.PUT("/:id", middleware.AuthMiddleware(), h.Update)
	r.DELETE("/:id", middleware.AuthMiddleware(), h.Delete)
	r.POST("/:id/like", h.Like)
}
