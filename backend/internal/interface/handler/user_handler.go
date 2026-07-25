package handler

import (
	"blog-backend/internal/application/user"
	"blog-backend/internal/infrastructure/middleware"
	"blog-backend/internal/infrastructure/response"
	"blog-backend/pkg/config"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type UserHandler struct {
	service *user.UserService
}

func NewUserHandler(service *user.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) Register(c *gin.Context) {
	var cmd user.RegisterCmd
	if err := c.ShouldBindJSON(&cmd); err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	if err := h.service.Register(c.Request.Context(), &cmd); err != nil {
		if err == user.ErrUserExists {
			response.Error(c, 400, "用户已存在")
			return
		}
		response.Error(c, 500, "注册失败")
		return
	}

	response.Success(c, nil)
}

func (h *UserHandler) Login(c *gin.Context) {
	var cmd user.LoginCmd
	if err := c.ShouldBindJSON(&cmd); err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	u, err := h.service.Login(c.Request.Context(), &cmd)
	if err != nil {
		if err == user.ErrUserNotFound || err == user.ErrInvalidPassword {
			response.Error(c, 400, "用户名或密码错误")
			return
		}
		response.Error(c, 500, "登录失败")
		return
	}

	token, err := generateToken(u.ID)
	if err != nil {
		response.Error(c, 500, "生成token失败")
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       u.ID,
			"username": u.Username,
			"nickname": u.Nickname,
			"email":    u.Email,
			"avatar":   u.Avatar,
		},
	})
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	dto, err := h.service.GetByID(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, 404, "用户不存在")
		return
	}

	response.Success(c, dto)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	var cmd user.UpdateCmd
	if err := c.ShouldBindJSON(&cmd); err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	dto, err := h.service.Update(c.Request.Context(), userID, &cmd)
	if err != nil {
		response.Error(c, 500, "更新失败")
		return
	}

	response.Success(c, dto)
}

func (h *UserHandler) GetUserByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	dto, err := h.service.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		response.Error(c, 404, "用户不存在")
		return
	}

	response.Success(c, dto)
}

func (h *UserHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	dtos, total, err := h.service.List(c.Request.Context(), page, pageSize)
	if err != nil {
		response.Error(c, 500, "获取用户列表失败")
		return
	}

	response.Success(c, gin.H{
		"list":  dtos,
		"total": total,
	})
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 400, "参数错误")
		return
	}

	if err := h.service.Delete(c.Request.Context(), uint(id)); err != nil {
		if err == user.ErrUserNotFound {
			response.Error(c, 404, "用户不存在")
			return
		}
		response.Error(c, 500, "删除失败")
		return
	}

	response.Success(c, nil)
}

func (h *UserHandler) Logout(c *gin.Context) {
	token := c.GetHeader("Authorization")
	token = strings.TrimPrefix(token, "Bearer ")

	claims := &jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.GetConfig().JWT.Secret), nil
	})

	if err == nil {
		if exp, ok := (*claims)["exp"].(float64); ok {
			middleware.AddTokenToBlacklist(c.Request.Context(), token, int64(exp))
		}
	}

	response.Success(c, nil)
}

func generateToken(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Second * time.Duration(config.GetConfig().JWT.Expire)).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.GetConfig().JWT.Secret))
}

func (h *UserHandler) Routes(r *gin.RouterGroup) {
	r.POST("/register", h.Register)
	r.POST("/login", h.Login)
	r.POST("/logout", middleware.AuthMiddleware(), h.Logout)

	r.GET("/profile", middleware.AuthMiddleware(), h.GetProfile)
	r.PUT("/profile", middleware.AuthMiddleware(), h.UpdateProfile)

	r.GET("/:id", h.GetUserByID)
	r.GET("/", h.ListUsers)
	r.DELETE("/:id", middleware.AuthMiddleware(), h.DeleteUser)
}
