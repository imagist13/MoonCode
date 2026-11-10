package handler

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/tajiaoyezi/blog-go-next/backend/internal/model"
	"github.com/tajiaoyezi/blog-go-next/backend/internal/service"
)

type MusicHandler struct {
	svc *service.MusicService
}

func NewMusicHandler(svc *service.MusicService) *MusicHandler {
	return &MusicHandler{svc: svc}
}

// ListEnabled 前台公开：启用的点唱机曲目列表。
func (h *MusicHandler) ListEnabled(c *gin.Context) {
	musics, err := h.svc.ListEnabled(c.Request.Context())
	if err != nil {
		FailServer(c, err.Error())
		return
	}
	if musics == nil {
		musics = []model.Music{}
	}
	OK(c, musics)
}

// ListAdmin 后台分页列表。
func (h *MusicHandler) ListAdmin(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("current", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	result, err := h.svc.ListAdmin(c.Request.Context(), page, size, c.Query("keywords"))
	if err != nil {
		FailServer(c, err.Error())
		return
	}
	OK(c, result)
}

func (h *MusicHandler) SaveOrUpdate(c *gin.Context) {
	var music model.Music
	if err := c.ShouldBindJSON(&music); err != nil {
		FailValidation(c, "请填写曲目信息")
		return
	}
	if err := h.svc.SaveOrUpdate(c.Request.Context(), &music); err != nil {
		if errors.Is(err, service.ErrMusicNameRequired) || errors.Is(err, service.ErrMusicURLRequired) {
			FailValidation(c, err.Error())
			return
		}
		FailServer(c, err.Error())
		return
	}
	OK(c, nil)
}

func (h *MusicHandler) Delete(c *gin.Context) {
	var ids []int
	if err := c.ShouldBindJSON(&ids); err != nil {
		FailValidation(c, "参数错误")
		return
	}
	if err := h.svc.Delete(c.Request.Context(), ids); err != nil {
		FailServer(c, err.Error())
		return
	}
	OK(c, nil)
}
