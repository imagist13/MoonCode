package handler

import (
	"blog-backend/internal/application/article"
	"blog-backend/internal/application/category"
	"blog-backend/internal/application/tag"
	"blog-backend/internal/application/user"
	"blog-backend/internal/infrastructure/middleware"
	"blog-backend/internal/infrastructure/persistence"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	v1 := r.Group("/api/v1")
	{
		v1.GET("/healthz", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		setupUserRoutes(v1)
		setupArticleRoutes(v1)
		setupCategoryRoutes(v1)
		setupTagRoutes(v1)
	}

	return r
}

func setupUserRoutes(r *gin.RouterGroup) {
	userRepo := persistence.NewUserRepository()
	userService := user.NewUserService(userRepo)
	userHandler := NewUserHandler(userService)
	userHandler.Routes(r.Group("/users"))
}

func setupArticleRoutes(r *gin.RouterGroup) {
	articleRepo := persistence.NewArticleRepository()
	articleService := article.NewArticleService(articleRepo)
	articleHandler := NewArticleHandler(articleService)
	articleHandler.Routes(r.Group("/articles"))
}

func setupCategoryRoutes(r *gin.RouterGroup) {
	categoryRepo := persistence.NewCategoryRepository()
	categoryService := category.NewCategoryService(categoryRepo)
	categoryHandler := NewCategoryHandler(categoryService)
	categoryHandler.Routes(r.Group("/categories"))
}

func setupTagRoutes(r *gin.RouterGroup) {
	tagRepo := persistence.NewTagRepository()
	tagService := tag.NewTagService(tagRepo)
	tagHandler := NewTagHandler(tagService)
	tagHandler.Routes(r.Group("/tags"))
}