package user

import (
	"blog-backend/internal/domain/user"
	"context"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserExists      = errors.New("用户已存在")
	ErrUserNotFound    = errors.New("用户不存在")
	ErrInvalidPassword = errors.New("密码错误")
)

type UserService struct {
	repo user.Repository
}

func NewUserService(repo user.Repository) *UserService {
	return &UserService{repo: repo}
}

type RegisterCmd struct {
	Username string
	Password string
	Nickname string
	Email    string
}

type LoginCmd struct {
	Username string
	Password string
}

type UpdateCmd struct {
	Nickname string
	Email    string
	Avatar   string
	Bio      string
}

type UserDTO struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Avatar   string `json:"avatar"`
	Bio      string `json:"bio"`
	Status   int    `json:"status"`
}

func (s *UserService) Register(ctx context.Context, cmd *RegisterCmd) error {
	_, err := s.repo.FindByUsername(ctx, cmd.Username)
	if err == nil {
		return ErrUserExists
	}

	if cmd.Email != "" {
		_, err := s.repo.FindByEmail(ctx, cmd.Email)
		if err == nil {
			return ErrUserExists
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(cmd.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	u := &user.User{
		Username: cmd.Username,
		Password: string(hashedPassword),
		Nickname: cmd.Nickname,
		Email:    cmd.Email,
	}

	return s.repo.Create(ctx, u)
}

func (s *UserService) Login(ctx context.Context, cmd *LoginCmd) (*user.User, error) {
	u, err := s.repo.FindByUsername(ctx, cmd.Username)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(cmd.Password)); err != nil {
		return nil, ErrInvalidPassword
	}

	return u, nil
}

func (s *UserService) GetByID(ctx context.Context, id uint) (*UserDTO, error) {
	u, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return toDTO(u), nil
}

func (s *UserService) Update(ctx context.Context, id uint, cmd *UpdateCmd) (*UserDTO, error) {
	u, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if cmd.Nickname != "" {
		u.Nickname = cmd.Nickname
	}
	if cmd.Email != "" {
		u.Email = cmd.Email
	}
	if cmd.Avatar != "" {
		u.Avatar = cmd.Avatar
	}
	if cmd.Bio != "" {
		u.Bio = cmd.Bio
	}

	if err := s.repo.Update(ctx, u); err != nil {
		return nil, err
	}

	return toDTO(u), nil
}

func (s *UserService) Delete(ctx context.Context, id uint) error {
	_, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return ErrUserNotFound
	}

	return s.repo.Delete(ctx, id)
}

func (s *UserService) List(ctx context.Context, page, pageSize int) ([]*UserDTO, int64, error) {
	users, total, err := s.repo.List(ctx, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	dtos := make([]*UserDTO, 0, len(users))
	for _, u := range users {
		dtos = append(dtos, toDTO(u))
	}

	return dtos, total, nil
}

func toDTO(u *user.User) *UserDTO {
	return &UserDTO{
		ID:       u.ID,
		Username: u.Username,
		Nickname: u.Nickname,
		Email:    u.Email,
		Avatar:   u.Avatar,
		Bio:      u.Bio,
		Status:   u.Status,
	}
}
