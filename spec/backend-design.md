# MoonBlog 后端技术设计文档

## 1. 项目概述

MoonBlog 是一个基于 Go + PostgreSQL + Redis 的个人博客后端服务，采用 DDD（领域驱动设计）架构模式。

### 1.1 技术栈

| 分类 | 技术 | 版本 |
|:----|:-----|:-----|
| 语言 | Go | 1.25+ |
| Web框架 | Gin | 1.12.0 |
| ORM | GORM | 1.31.1 |
| 数据库 | PostgreSQL | 16 |
| 缓存 | Redis | 7 |
| 认证 | JWT | 5.3.1 |

### 1.2 核心功能

- 用户管理（注册、登录、认证）
- 文章管理（CRUD、分类、标签）
- 分类管理
- 标签管理
- 缓存优化

---

## 2. 架构设计

### 2.1 DDD 分层架构

```
┌─────────────────────────────────────────────────┐
│                  Interface 层                    │
│              (handler/ HTTP 处理器)              │
├─────────────────────────────────────────────────┤
│               Application 层                     │
│          (application/ 用例编排、DTO)             │
├─────────────────────────────────────────────────┤
│                 Domain 层                        │
│         (domain/ 实体、仓储接口、业务规则)          │
├─────────────────────────────────────────────────┤
│             Infrastructure 层                    │
│   (infrastructure/ 仓储实现、数据库、外部服务)      │
└─────────────────────────────────────────────────┘
```

### 2.2 依赖规则

```
Interface → Application → Domain
     ↓           ↓          ↓
  Infrastructure (实现 Domain 定义的接口)
```

### 2.3 目录结构

```
backend/
├── cmd/
│   └── server/main.go              # 服务入口
├── internal/
│   ├── domain/                     # 领域层
│   │   ├── user/
│   │   │   ├── entity.go           # 用户实体
│   │   │   └── repository.go       # 用户仓储接口
│   │   ├── article/
│   │   │   ├── entity.go           # 文章实体
│   │   │   ├── article_tags.go     # 文章标签关联
│   │   │   └── repository.go       # 文章仓储接口
│   │   ├── category/
│   │   │   ├── entity.go           # 分类实体
│   │   │   └── repository.go       # 分类仓储接口
│   │   └── tag/
│   │       ├── entity.go           # 标签实体
│   │       └── repository.go       # 标签仓储接口
│   ├── application/                # 应用层
│   │   ├── user/service.go         # 用户服务
│   │   ├── article/service.go      # 文章服务
│   │   ├── category/service.go     # 分类服务
│   │   └── tag/service.go          # 标签服务
│   ├── interface/                  # 接口层
│   │   └── handler/
│   │       ├── user_handler.go     # 用户路由处理器
│   │       ├── article_handler.go  # 文章路由处理器
│   │       ├── category_handler.go # 分类路由处理器
│   │       ├── tag_handler.go      # 标签路由处理器
│   │       └── router.go           # 路由配置
│   └── infrastructure/             # 基础设施层
│       ├── persistence/            # 数据持久化
│       │   ├── user_repository.go
│       │   ├── article_repository.go
│       │   ├── category_repository.go
│       │   └── tag_repository.go
│       ├── response/               # 统一响应
│       │   └── response.go
│       └── middleware/             # 中间件
│           ├── auth.go             # JWT认证
│           ├── cors.go             # CORS
│           └── logout.go           # 登出黑名单
└── pkg/                            # 公共包
    ├── config/config.go            # 配置管理
    ├── database/database.go        # 数据库初始化
    └── redis/                      # Redis客户端
        ├── redis.go                # 初始化
        └── cache.go                # 缓存工具
```

---

## 3. 数据库设计

### 3.1 用户表 (users)

| 字段 | 类型 | 约束 | 说明 |
|:----|:-----|:-----|:-----|
| id | BIGSERIAL | PRIMARY KEY | 主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码哈希 |
| nickname | VARCHAR(50) | | 昵称 |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| avatar | VARCHAR(255) | | 头像URL |
| status | INT | DEFAULT 1 | 状态: 1=正常, 0=禁用 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |
| deleted_at | TIMESTAMP | | 软删除时间 |

### 3.2 文章表 (articles)

| 字段 | 类型 | 约束 | 说明 |
|:----|:-----|:-----|:-----|
| id | BIGSERIAL | PRIMARY KEY | 主键 |
| title | VARCHAR(255) | NOT NULL | 标题 |
| slug | VARCHAR(100) | UNIQUE | URL别名 |
| content | TEXT | | 内容 |
| description | VARCHAR(500) | | 描述 |
| author_id | BIGINT | NOT NULL, FK | 作者ID |
| category_id | BIGINT | FK | 分类ID |
| status | INT | DEFAULT 1 | 状态: 1=草稿, 2=已发布 |
| view_count | INT | DEFAULT 0 | 浏览量 |
| likes | INT | DEFAULT 0 | 点赞数 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |
| deleted_at | TIMESTAMP | | 软删除时间 |

### 3.3 分类表 (categories)

| 字段 | 类型 | 约束 | 说明 |
|:----|:-----|:-----|:-----|
| id | BIGSERIAL | PRIMARY KEY | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 名称 |
| slug | VARCHAR(50) | UNIQUE | URL别名 |
| parent_id | BIGINT | FK | 父分类ID |
| sort | INT | DEFAULT 0 | 排序 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |
| deleted_at | TIMESTAMP | | 软删除时间 |

### 3.4 标签表 (tags)

| 字段 | 类型 | 约束 | 说明 |
|:----|:-----|:-----|:-----|
| id | BIGSERIAL | PRIMARY KEY | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 名称 |
| slug | VARCHAR(50) | UNIQUE | URL别名 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |
| deleted_at | TIMESTAMP | | 软删除时间 |

### 3.5 文章标签关联表 (article_tags)

| 字段 | 类型 | 约束 | 说明 |
|:----|:-----|:-----|:-----|
| article_id | BIGINT | PRIMARY KEY, FK | 文章ID |
| tag_id | BIGINT | PRIMARY KEY, FK | 标签ID |

### 3.6 ER 图

```
users          articles          categories         tags
─────          ────────          ──────────         ────
id ──────────> author_id         id                 id
username      title              name               name
password      slug               slug               slug
nickname      content            parent_id
email         description        sort
avatar        category_id
status        status
              view_count
              likes

                article_tags
                ────────────
                article_id <───── articles.id
                tag_id     <───── tags.id
```

---

## 4. API 设计

### 4.1 响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

| code | 含义 |
|:----|:-----|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未认证 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 4.2 用户接口

| 方法 | 路径 | 认证 | 描述 |
|:----|:-----|:-----|:-----|
| POST | /api/v1/users/register | 否 | 用户注册 |
| POST | /api/v1/users/login | 否 | 用户登录 |
| POST | /api/v1/users/logout | 是 | 用户登出 |
| GET | /api/v1/users/profile | 是 | 获取当前用户 |
| PUT | /api/v1/users/profile | 是 | 更新用户信息 |
| GET | /api/v1/users/:id | 否 | 获取用户详情 |
| GET | /api/v1/users | 否 | 获取用户列表 |
| DELETE | /api/v1/users/:id | 是 | 删除用户 |

#### 4.2.1 注册

**请求:**
```json
{
  "username": "string (必填, 唯一)",
  "password": "string (必填)",
  "nickname": "string",
  "email": "string"
}
```

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": null
}
```

#### 4.2.2 登录

**请求:**
```json
{
  "username": "string (必填)",
  "password": "string (必填)"
}
```

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "string (JWT)",
    "user": {
      "id": 1,
      "username": "string",
      "nickname": "string",
      "email": "string",
      "avatar": "string"
    }
  }
}
```

### 4.3 文章接口

| 方法 | 路径 | 认证 | 描述 |
|:----|:-----|:-----|:-----|
| POST | /api/v1/articles | 是 | 创建文章 |
| GET | /api/v1/articles | 否 | 获取文章列表 |
| GET | /api/v1/articles/:id | 否 | 获取文章详情 |
| GET | /api/v1/articles/slug/:slug | 否 | 通过slug获取文章 |
| PUT | /api/v1/articles/:id | 是 | 更新文章 |
| DELETE | /api/v1/articles/:id | 是 | 删除文章 |
| POST | /api/v1/articles/:id/like | 否 | 点赞文章 |

#### 4.3.1 创建文章

**请求:**
```json
{
  "title": "string (必填)",
  "content": "string (必填)",
  "description": "string",
  "category_id": 1,
  "status": 1
}
```

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "title": "string",
    "slug": "string",
    "content": "string",
    "description": "string",
    "author_id": 1,
    "category_id": 1,
    "status": 1,
    "view_count": 0,
    "likes": 0
  }
}
```

#### 4.3.2 文章列表

**请求参数:**

| 参数 | 类型 | 默认值 | 说明 |
|:----|:-----|:-----|:-----|
| page | int | 1 | 页码 |
| pageSize | int | 10 | 每页数量 |
| category_id | int | | 分类ID筛选 |
| status | int | | 状态筛选 |

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [...],
    "total": 100
  }
}
```

### 4.4 分类接口

| 方法 | 路径 | 认证 | 描述 |
|:----|:-----|:-----|:-----|
| POST | /api/v1/categories | 是 | 创建分类 |
| GET | /api/v1/categories | 否 | 获取分类列表 |
| GET | /api/v1/categories/:id | 否 | 获取分类详情 |
| GET | /api/v1/categories/slug/:slug | 否 | 通过slug获取分类 |
| PUT | /api/v1/categories/:id | 是 | 更新分类 |
| DELETE | /api/v1/categories/:id | 是 | 删除分类 |

### 4.5 标签接口

| 方法 | 路径 | 认证 | 描述 |
|:----|:-----|:-----|:-----|
| POST | /api/v1/tags | 是 | 创建标签 |
| GET | /api/v1/tags | 否 | 获取标签列表 |
| GET | /api/v1/tags/:id | 否 | 获取标签详情 |
| GET | /api/v1/tags/slug/:slug | 否 | 通过slug获取标签 |
| PUT | /api/v1/tags/:id | 是 | 更新标签 |
| DELETE | /api/v1/tags/:id | 是 | 删除标签 |

---

## 5. Redis 缓存设计

### 5.1 缓存策略

| 缓存键 | 用途 | 过期时间 |
|:------|:-----|:--------|
| jwt_blacklist:{token} | JWT黑名单 | token有效期 |

### 5.2 未来扩展缓存

| 缓存键 | 用途 | 过期时间 |
|:------|:-----|:--------|
| article:detail:{id} | 文章详情 | 5分钟 |
| article:list:{page}:{pageSize} | 文章列表 | 2分钟 |
| category:list | 分类列表 | 10分钟 |
| tag:list | 标签列表 | 10分钟 |

---

## 6. JWT 认证设计

### 6.1 Token 结构

```json
{
  "user_id": 1,
  "exp": 1719283200
}
```

### 6.2 认证流程

1. 用户登录成功后生成 JWT Token
2. 客户端请求时在 Header 中携带 `Authorization: Bearer {token}`
3. 服务端中间件验证 Token 有效性
4. 验证通过后解析 user_id 存入请求上下文
5. 用户登出时将 Token 加入 Redis 黑名单

---

## 7. 部署与配置

### 7.1 环境变量

| 变量名 | 默认值 | 说明 |
|:------|:-----|:-----|
| SERVER_PORT | 8080 | 服务端口 |
| DB_HOST | localhost | 数据库主机 |
| DB_PORT | 5432 | 数据库端口 |
| DB_NAME | moon_blog | 数据库名 |
| DB_USER | moon_user | 数据库用户 |
| DB_PASSWORD | moon_password | 数据库密码 |
| DB_SSL_MODE | disable | SSL模式 |
| REDIS_HOST | localhost | Redis主机 |
| REDIS_PORT | 6379 | Redis端口 |
| REDIS_PASSWORD | | Redis密码 |
| JWT_SECRET | moon-blog-jwt-secret-key | JWT密钥 |

### 7.2 Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: moon_blog
      POSTGRES_USER: moon_user
      POSTGRES_PASSWORD: moon_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 8. 开发流程

### 8.1 启动服务

```bash
# 启动数据库和缓存
docker compose up -d

# 进入后端目录
cd backend

# 安装依赖
go mod tidy

# 启动服务
go run cmd/server/main.go

# 服务运行在 http://localhost:8080
```

### 8.2 数据库迁移

使用 GORM AutoMigrate 自动迁移：

```go
db.AutoMigrate(
    &user.User{},
    &article.Article{},
    &category.Category{},
    &tag.Tag{},
    &article.ArticleTag{},
)
```

---

## 9. 安全考虑

1. **密码加密**: 使用 bcrypt 加密存储密码
2. **JWT 认证**: 无状态认证，Token 含过期时间
3. **Token 黑名单**: 登出时将 Token 加入 Redis 黑名单
4. **CORS 配置**: 限制跨域访问
5. **参数验证**: 使用 validator 进行请求参数验证

---

## 10. 待办事项

- [x] 项目架构设计
- [x] DDD 分层实现
- [x] 用户认证模块
- [x] 文章 CRUD 模块
- [x] 分类管理模块
- [x] 标签管理模块
- [x] Redis 缓存集成
- [ ] 文章标签关联功能
- [ ] 图片上传功能
- [ ] 评论系统
- [ ] RSS 订阅
- [ ] 管理员后台