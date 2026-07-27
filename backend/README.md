# Moon Blog · 后端文档

> Go 1.25 · Gin · GORM · PostgreSQL · Redis · JWT
> DDD 四层架构 · 单体服务 · 提供 REST API 给 Next.js 前端

---

## 目录

1. [项目速览](#1-项目速览)
2. [目录结构](#2-目录结构)
3. [DDD 分层](#3-ddd-分层)
4. [环境准备](#4-环境准备)
5. [配置说明](#5-配置说明)
6. [启动方式](#6-启动方式)
7. [数据模型](#7-数据模型)
8. [统一响应格式](#8-统一响应格式)
9. [认证机制（JWT + Redis 黑名单）](#9-认证机制jwt--redis-黑名单)
10. [中间件](#10-中间件)
11. [完整 API 参考](#11-完整-api-参考)
12. [错误码](#12-错误码)
13. [Redis 缓存策略](#13-redis-缓存策略)
14. [开发规范](#14-开发规范)
15. [调试与常见问题](#15-调试与常见问题)
16. [待办事项](#16-待办事项)

---

## 1. 项目速览

| 项 | 值 |
|---|---|
| 模块名 | `blog-backend` |
| Go 版本 | 1.25.0 |
| Web 框架 | Gin 1.12 |
| ORM | GORM 1.25 |
| 数据库 | PostgreSQL 16 |
| 缓存 | Redis 7 |
| 认证 | JWT（HS256） |
| 密码哈希 | bcrypt (`golang.org/x/crypto/bcrypt`) |
| 入口 | [cmd/server/main.go](file:///d:/桌面/moon/backend/cmd/server/main.go) |
| 默认端口 | `:8080` |
| API 前缀 | `/api/v1` |

---

## 2. 目录结构

```
backend/
├── cmd/
│   └── server/main.go               # 服务入口
├── go.mod / go.sum
├── .env.example                     # 配置样例
└── internal/
    ├── domain/                      # 领域层（实体 + 仓储接口）
    │   ├── user/       entity.go  repository.go
    │   ├── article/    entity.go  repository.go  article_tags.go
    │   ├── category/   entity.go  repository.go
    │   └── tag/        entity.go  repository.go
    │
    ├── application/                 # 应用层（用例编排 / DTO / Cmd）
    │   ├── user/       service.go
    │   ├── article/    service.go
    │   ├── category/   service.go
    │   └── tag/        service.go
    │
    ├── infrastructure/              # 基础设施层
    │   ├── persistence/             #   GORM 仓储实现
    │   │   ├── user_repository.go
    │   │   ├── article_repository.go
    │   │   ├── category_repository.go
    │   │   └── tag_repository.go
    │   ├── middleware/              #   CORS / Auth / Logout（黑名单）
    │   │   ├── auth.go
    │   │   ├── cors.go
    │   │   └── logout.go
    │   └── response/                #   统一响应封装
    │       └── response.go
    │
    └── interface/                   # 接口层（HTTP Handler）
        └── handler/
            ├── router.go            #   路由装配 + 依赖注入
            ├── user_handler.go
            ├── article_handler.go
            ├── category_handler.go
            └── tag_handler.go

└── pkg/                             # 通用工具
    ├── config/    config.go         # 配置加载
    ├── database/  database.go       # PostgreSQL 初始化
    └── redis/     redis.go cache.go # Redis 客户端 + 缓存封装
```

---

## 3. DDD 分层

单向依赖：`Interface → Application → Domain ← Infrastructure`

| 层 | 职责 | 依赖 |
|---|---|---|
| **Domain** | 实体、值对象、领域仓储接口、领域规则 | 无 |
| **Application** | 用例编排、事务、DTO / Command、领域接口调用 | Domain |
| **Infrastructure** | 仓储 GORM 实现、缓存、中间件、外部服务 | Domain |
| **Interface** | HTTP Handler、参数绑定、响应封装 | Application + Infrastructure |

### 典型请求链路

```
POST /api/v1/articles
    │
    ▼
[Interface] ArticleHandler.Create
    │  参数校验 + AuthorID = c.GetUint("user_id")
    ▼
[Application] ArticleService.Create(ctx, cmd)
    │  业务规则（slug 生成、状态默认值...）
    ▼
[Domain] article.Repository.Create(entity)   ← 接口
    │
    ▼
[Infrastructure] persistence.ArticleRepository.Create   ← 实现（GORM）
    │
    ▼
PostgreSQL
```

---

## 4. 环境准备

### 4.1 开发工具

- Go 1.25+（`go version`）
- Docker Desktop / OrbStack（跑 PG + Redis）
- 推荐 IDE：VS Code + Go 扩展 / GoLand

### 4.2 依赖服务（docker-compose）

项目根目录 [docker-compose.yml](file:///d:/桌面/moon/docker-compose.yml)：

```bash
docker compose up -d
```

启动后：

| 服务 | 端口 | 账号密码 |
|---|---|---|
| postgres | 5432 | moon_user / moon_password |
| redis | 6379 | — |

数据库：`moon_blog`

---

## 5. 配置说明

配置通过 [pkg/config/config.go](file:///d:/桌面/moon/backend/pkg/config/config.go) 从环境变量加载；样例见 [.env.example](file:///d:/桌面/moon/backend/.env.example)。

| 环境变量 | 默认 | 说明 |
|---|---|---|
| `APP_MODE` | `debug` | `debug` / `release` |
| `APP_PORT` | `8080` | 监听端口 |
| `DB_HOST` | `localhost` | PostgreSQL 主机 |
| `DB_PORT` | `5432` | PostgreSQL 端口 |
| `DB_USER` | `moon_user` | 数据库用户 |
| `DB_PASSWORD` | `moon_password` | 数据库密码 |
| `DB_NAME` | `moon_blog` | 数据库名 |
| `REDIS_HOST` | `localhost` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `REDIS_PASSWORD` | `` | Redis 密码 |
| `REDIS_DB` | `0` | Redis 库编号 |
| `JWT_SECRET` | `change-me` | JWT 签名密钥（**必须修改**） |
| `JWT_EXPIRE` | `86400` | 有效期（秒） |

---

## 6. 启动方式

```bash
cd backend

# 1. 依赖
go mod tidy

# 2. 启动依赖服务
docker compose up -d      # 在项目根目录

# 3. 拷贝配置
cp .env.example .env

# 4. 启动服务
go run cmd/server/main.go
# 或
go build -o bin/moon-blog cmd/server/main.go && ./bin/moon-blog
```

启动成功日志：

```
[GIN-debug] Listening and serving HTTP on :8080
```

---

## 7. 数据模型

所有模型都嵌入 GORM 的 `ID / CreatedAt / UpdatedAt / DeletedAt`。

### 7.1 用户 `users`

参考 [internal/domain/user/entity.go](file:///d:/桌面/moon/backend/internal/domain/user/entity.go)

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uint | PK | 主键 |
| username | varchar(50) | unique, not null | 登录名 |
| password | varchar(255) | not null | bcrypt 哈希 |
| nickname | varchar(50) | | 显示名 |
| email | varchar(100) | unique | 邮箱 |
| avatar | varchar(255) | | 头像 URL |
| bio | text | | 简介 |
| role | int | default 1 | 1=普通 2=管理 |
| created_at / updated_at / deleted_at | timestamp | | 软删除 |

### 7.2 文章 `articles`

参考 [internal/domain/article/entity.go](file:///d:/桌面/moon/backend/internal/domain/article/entity.go)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uint | PK |
| title | varchar(255) | 标题 |
| slug | varchar(100) unique | URL slug |
| content | text | Markdown 正文 |
| description | varchar(500) | 摘要 |
| author_id | uint | 作者（→ users.id） |
| category_id | uint | 分类（→ categories.id） |
| status | int default 1 | 1=草稿 2=已发布 3=归档 |
| view_count | int default 0 | 浏览量 |
| likes | int default 0 | 点赞数 |
| cover | varchar(255) | 封面图 |
| created_at / updated_at / deleted_at | | 软删除 |

### 7.3 分类 `categories`

| 字段 | 说明 |
|---|---|
| id | PK |
| name | 名称 |
| slug | URL slug（unique） |
| description | 描述 |
| parent_id | 支持二级分类，null=顶级 |

### 7.4 标签 `tags`

| 字段 | 说明 |
|---|---|
| id | PK |
| name | unique |
| slug | unique |

### 7.5 关联表 `article_tags`

参考 [internal/domain/article/article_tags.go](file:///d:/桌面/moon/backend/internal/domain/article/article_tags.go)

多对多：`article_id + tag_id` 组合主键。

---

## 8. 统一响应格式

见 [internal/infrastructure/response/response.go](file:///d:/桌面/moon/backend/internal/infrastructure/response/response.go)

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

| 字段 | 说明 |
|---|---|
| `code` | 0 = 成功；非 0 = 业务/HTTP 错误码 |
| `message` | 描述文案 |
| `data` | 数据（可为 null / 对象 / 列表包装 `{list, total}`） |

约定辅助函数：

- `response.Success(c, data)` → `code=0, message="success"`
- `response.Error(c, code, message)` → 设置 HTTP status 与自定义 code

---

## 9. 认证机制（JWT + Redis 黑名单）

### 9.1 登录

`POST /api/v1/users/login` 成功后返回：

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "username": "moon", ... }
  }
}
```

### 9.2 携带凭证

需登录的接口需在 Header 添加：

```
Authorization: Bearer <token>
```

### 9.3 JWT Claims

```go
{
  "user_id": 1,
  "exp": 1735689600
}
```

签名算法 `HS256`，密钥 `JWT_SECRET`，有效期 `JWT_EXPIRE`（秒）。

### 9.4 登出（Redis 黑名单）

`POST /api/v1/users/logout` 会把当前 token 写入 Redis：
- key：`jwt:blacklist:<token>`
- ttl：token 剩余有效期

`AuthMiddleware` 每次请求会同时校验：
1. 签名有效 && 未过期
2. **token 不在黑名单**

实现见 [middleware/auth.go](file:///d:/桌面/moon/backend/internal/infrastructure/middleware/auth.go) 与 [middleware/logout.go](file:///d:/桌面/moon/backend/internal/infrastructure/middleware/logout.go)。

---

## 10. 中间件

装配顺序（[router.go](file:///d:/桌面/moon/backend/internal/interface/handler/router.go)）：

```
Recovery ─▶ Logger ─▶ CORS ─▶ 路由（部分带 Auth）
```

| 中间件 | 位置 | 作用 |
|---|---|---|
| `gin.Recovery` | Gin 默认 | panic 兜底 |
| `gin.Logger` | Gin 默认 | 访问日志 |
| `CORSMiddleware` | 全局 | 跨域（开发放开所有源，生产按需配置） |
| `AuthMiddleware` | 路由级 | 校验 JWT + 黑名单，写入 `user_id` 到 `gin.Context` |

在 Handler 中通过 `c.GetUint("user_id")` 获取当前用户。

---

## 11. 完整 API 参考

统一前缀 `/api/v1`。带 🔒 表示需要 `Authorization: Bearer <token>`。

### 11.1 用户 `/users`

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/register` | 注册 |
| POST | `/login` | 登录 |
| POST | `/logout` 🔒 | 登出（token 加入黑名单） |
| GET | `/profile` 🔒 | 当前用户信息 |
| PUT | `/profile` 🔒 | 更新当前用户信息 |
| GET | `/:id` | 按 ID 查询用户（公开） |
| GET | `/?page&pageSize` | 用户列表 |
| DELETE | `/:id` 🔒 | 删除用户 |

**注册 Body**：

```json
{ "username": "moon", "password": "123456", "nickname": "Moon", "email": "moon@example.com" }
```

**登录 Body**：

```json
{ "username": "moon", "password": "123456" }
```

### 11.2 文章 `/articles`

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/` 🔒 | 创建（AuthorID 从 token 取） |
| GET | `/` | 列表（支持 `page`、`pageSize`、`category_id`、`status`） |
| GET | `/:id` | 详情（自动 `+1` 浏览） |
| GET | `/slug/:slug` | 按 slug 查（自动 `+1` 浏览） |
| PUT | `/:id` 🔒 | 更新 |
| DELETE | `/:id` 🔒 | 删除（软删） |
| POST | `/:id/like` | 点赞（浏览器直接调用，无需登录） |

**创建 Body**：

```json
{
  "title": "用 DDD 构建 Go 后端",
  "slug": "go-ddd",
  "description": "拆分四层...",
  "content": "# 正文...",
  "category_id": 1,
  "status": 2,
  "cover": "https://..."
}
```

**列表返回**：

```json
{
  "code": 0,
  "data": {
    "list": [ { "id":1, "title":"...", "slug":"...", ... } ],
    "total": 42
  }
}
```

### 11.3 分类 `/categories`

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/` 🔒 | 创建 |
| GET | `/?page&pageSize&parent_id` | 列表 |
| GET | `/:id` | 详情 |
| GET | `/slug/:slug` | 按 slug 查 |
| PUT | `/:id` 🔒 | 更新 |
| DELETE | `/:id` 🔒 | 删除 |

### 11.4 标签 `/tags`

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/` 🔒 | 创建 |
| GET | `/?page&pageSize` | 列表 |
| GET | `/:id` | 详情 |
| GET | `/slug/:slug` | 按 slug 查 |
| PUT | `/:id` 🔒 | 更新 |
| DELETE | `/:id` 🔒 | 删除 |

---

## 12. 错误码

| code | 含义 |
|---|---|
| `0` | 成功 |
| `400` | 参数错误 / 校验失败 |
| `401` | 未登录 / token 无效 / 已登出 |
| `403` | 无权限 |
| `404` | 资源不存在 |
| `500` | 服务器内部错误 |

业务态错误由 Application 层通过 `error` 返回，Handler 判断：

- `user.ErrUserExists` → 400
- `user.ErrUserNotFound / ErrInvalidPassword` → 400
- `category.ErrCategoryExists` → 400
- `tag.ErrTagExists` → 400

---

## 13. Redis 缓存策略

### 当前已实现

| 用途 | Key 规范 | TTL |
|---|---|---|
| JWT 黑名单 | `jwt:blacklist:<token>` | = token 剩余有效期 |

### 计划扩展

| 用途 | Key 规范 | TTL |
|---|---|---|
| 文章详情缓存 | `article:id:<id>` | 5 min |
| 文章 slug→id 映射 | `article:slug:<slug>` | 5 min |
| 文章列表页 | `article:list:p<page>:s<size>:c<catId>` | 60 s |
| 分类列表 | `category:list` | 10 min |
| 标签列表 | `tag:list` | 10 min |
| 浏览量计数（批写） | `article:vc:<id>` | 定时 flush 到 DB |
| 点赞防刷 | `article:like:<id>:ip:<ip>` | 24 h |

统一封装位置：[pkg/redis/cache.go](file:///d:/桌面/moon/backend/pkg/redis/cache.go)。

---

## 14. 开发规范

### 14.1 分层规则

- **Domain 不依赖任何外部框架**，只放实体、值对象、仓储接口
- **Application** 处理用例，不直接依赖 GORM，通过 Domain 接口访问数据
- **Infrastructure/persistence** 只实现 Domain 接口
- **Interface/handler** 保持薄，仅做参数绑定、鉴权、调用 Application、包装响应

### 14.2 Command / DTO 命名

- 入参：`CreateCmd` `UpdateCmd` `LoginCmd`
- 返回：`UserDTO` `ArticleDTO`
- 不要把 Domain 实体直接暴露给 HTTP 响应

### 14.3 错误处理

- Domain / Application 定义 `Err*` 变量（如 `ErrUserExists`）
- Handler 通过 `errors.Is` / `==` 判断并转 HTTP code
- 未识别错误统一返回 500

### 14.4 上下文与超时

所有 Repository / Service 方法首参传 `context.Context`（来自 `c.Request.Context()`）。后续引入 tracing 与 timeout 会依赖它。

### 14.5 提交规范

参考社区惯例：

```
feat(article): 支持按标签筛选文章列表
fix(auth): 修复登出后 token 仍可用
refactor(domain): 拆分 article 聚合根
docs(backend): 更新 API 文档
```

---

## 15. 调试与常见问题

**`AuthMiddleware` 返回 401**
- 请求头缺 `Authorization` 或格式非 `Bearer <token>`
- token 已过期（`exp` < now）
- token 已被登出（Redis 中存在黑名单）

**`connection refused` 连接 PG/Redis**
- `docker compose up -d` 未启动
- `.env` 里的 `DB_HOST` / `REDIS_HOST` 与容器暴露不一致

**表未自动建**
- `pkg/database/database.go` 需要 `AutoMigrate(&user.User{}, &article.Article{}, ...)`
- 若使用手工建表，请与实体 tag 保持一致

**`too many open files`**
- 检查是否遗漏 `rows.Close()`；GORM 一般自动处理，但 `Raw` 需注意

---

## 16. 待办事项

- [ ] `AutoMigrate` 主动注册所有实体
- [ ] Article ↔ Tag 多对多接口打通（当前仅表结构就绪）
- [ ] Article 详情、列表、分类/标签列表接入 Redis 缓存
- [ ] 权限系统（当前 role 字段未做校验；引入 admin 校验中间件）
- [ ] 请求参数校验（`binding` tag + validator）
- [ ] 全局错误码枚举 + i18n
- [ ] pprof / metrics endpoint
- [ ] 单元测试（Application 层）+ 集成测试（Testcontainers）
- [ ] Dockerfile + docker-compose.prod.yml
- [ ] Swagger / OpenAPI 自动生成
- [ ] 结构化日志（zap / slog）替代默认 Logger

---

> 本文件描述**当前代码**的实际能力与规范；计划中的能力在 [§16](#16-待办事项)。
> 更新代码后请同步维护此文档。
