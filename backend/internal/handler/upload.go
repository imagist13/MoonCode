package handler

import (
	"github.com/gin-gonic/gin"

	"github.com/tajiaoyezi/blog-go-next/backend/internal/service"
)

type UploadHandler struct {
	svc *service.UploadService
}

func NewUploadHandler(svc *service.UploadService) *UploadHandler {
	return &UploadHandler{svc: svc}
}

// UploadImage 上传图片
// 走严格图片路径：扩展名白名单（无 .svg/视频/文档）+ magic-byte MIME 校验
func (h *UploadHandler) UploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		FailValidation(c, "请选择要上传的文件")
		return
	}
	defer file.Close()

	url, err := h.svc.UploadImage(file, header.Filename, header.Size)
	if err != nil {
		FailServer(c, err.Error())
		return
	}
	OK(c, url)
}

// UploadAudio 上传音频（点唱机曲目）
// 扩展名白名单 + 拒绝文本/网页类内容伪装。
func (h *UploadHandler) UploadAudio(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		FailValidation(c, "请选择要上传的音频文件")
		return
	}
	defer file.Close()

	url, err := h.svc.UploadAudio(file, header.Filename, header.Size)
	if err != nil {
		FailValidation(c, err.Error())
		return
	}
	OK(c, url)
}
