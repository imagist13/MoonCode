package main

import (
	"blog-backend/internal/domain/article"
	"blog-backend/internal/domain/category"
	"blog-backend/internal/domain/tag"
	"blog-backend/internal/domain/user"
	"blog-backend/internal/interface/handler"
	"blog-backend/pkg/config"
	"blog-backend/pkg/database"
	"blog-backend/pkg/redis"
	"fmt"
	"log"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}

	if err := redis.InitRedis(); err != nil {
		log.Fatalf("Failed to init redis: %v", err)
	}

	if err := autoMigrate(); err != nil {
		log.Fatalf("Failed to auto migrate: %v", err)
	}

	r := handler.SetupRouter()

	port := config.GetConfig().Server.Port
	fmt.Printf("Server running on http://localhost:%s\n", port)
	if err := r.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

func autoMigrate() error {
	db := database.GetDB()

	if err := db.AutoMigrate(
		&user.User{},
		&article.Article{},
		&category.Category{},
		&tag.Tag{},
		&article.ArticleTag{},
	); err != nil {
		return fmt.Errorf("auto migrate failed: %w", err)
	}

	return nil
}