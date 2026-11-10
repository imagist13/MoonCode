# Backend · Moon Blog

Moon Blog 的 API 服务。基于 Go + Gin 构建，负责文章、评论、相册、点唱机、搜索、邮件、权限等业务，
对前端提供 `/api/v1/*` 接口，并托管上传文件。

## 技术栈

| 组件 | 用途 |
| --- | --- |
| Go 1.26 · Gin | HTTP 服务与路由 |
| GORM · PostgreSQL 16 | 数据持久化，`model.AllModels` 驱动 AutoMigrate |
| Casbin | RBAC 权限校验（角色 ↔ 资源） |
| JWT | 登录态，`Authorization: Bearer <token>` |
| Redis 7 | 滑动窗口限流、验证码、token 版本、点赞统计 |
| RabbitMQ | 异步邮件任务 |
| Elasticsearch 7 | 文章全文搜索 |
| Maxwell CDC | 监听 PostgreSQL 变更，增量同步文章到 ES |

## 目录结构

```
backend/
├── cmd/
│   ├── server/      # 主服务
│   ├── migrate/     # 显式执行 AutoMigrate + 基础数据（角色、页面）
│   ├── seed/        # 创建管理员账号 / 重置密码
│   └── reindex/     # 文章全量回填 Elasticsearch
├── internal/
│   ├── config/      # Viper 配置加载、PostgreSQL / Redis 初始化
│   ├── handler/     # Gin handler、路由注册、WebSocket ChatHub
│   ├── service/     # 业务逻辑
│   ├── repository/  # 泛型 BaseRepository[T] 数据访问
│   ├── model/       # GORM 模型、AutoMigrate、种子数据
│   ├── middleware/  # JWT、Casbin RBAC、限流、CORS、DB 注入
│   └── pkg/         # es / mail / mq / oauth / upload 等基础设施封装
├── migrations/      # 预留目录（当前 schema 由 GORM AutoMigrate 管理）
├── config.yaml        # 本地开发默认配置
├── config.docker.yaml # 容器内配置
└── Dockerfile
```

## 快速开始

### 1. 启动依赖服务

在仓库根目录执行：

```bash
docker compose up -d postgres redis rabbitmq elasticsearch
```

### 2. 配置环境变量

`config.yaml` 已带一套本地默认值（数据库 `blog/blog123`、Redis `localhost:6379`、
RabbitMQ `guest/guest`、ES `http://localhost:9200`）。**唯一必须显式提供的是 JWT 密钥**：

```bash
# bash / zsh
cd backend
JWT_SECRET="$(openssl rand -base64 48)" go run ./cmd/server
```

```powershell
# PowerShell
cd backend
$env:JWT_SECRET = "至少 32 字符的随机字符串"
go run ./cmd/server
```

服务默认监听 `:8080`，健康检查：

```bash
curl http://localhost:8080/health
# {"status":"ok"}
```

### 3. 创建管理员

管理员不再硬编码，首次部署需要显式执行 seed：

```bash
cd backend
SEED_ADMIN_EMAIL=admin@example.com \
SEED_ADMIN_PASSWORD='your-password' \
go run ./cmd/seed
```

- 密码至少 8 位；账号已存在时只补绑管理员角色，不改密码、不使旧 token 失效。
- 确需重置密码时追加 `SEED_ADMIN_RESET_PASSWORD=true`（会 bump token_version，旧 JWT 立即失效）。
- 未设置 `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` 时命令会打印提示并正常退出，便于在流水线中无条件调用。

## 配置

Viper 加载顺序：`CONFIG_PATH`（默认 `config.yaml`）→ 环境变量覆盖。配置文件不存在时不致命，
可完全依赖环境变量部署（K8s ConfigMap / Secret）。

| 环境变量 | 说明 |
| --- | --- |
| `CONFIG_PATH` | 配置文件路径，默认 `config.yaml` |
| `SERVER_PORT` / `SERVER_MODE` | 监听端口（默认 `8080`）与 `debug` / `release` / `test` |
| `SERVER_ALLOWED_ORIGINS` | CORS / WebSocket Origin 白名单，逗号分隔 |
| `POSTGRES_HOST` / `PORT` / `USER` / `PASSWORD` / `DB` | PostgreSQL 连接信息 |
| `DATABASE_SSLMODE` | 默认 `disable` |
| `REDIS_ADDR` 或 `REDIS_HOST` + `REDIS_PORT` | Redis 地址 |
| `REDIS_PASSWORD` / `REDIS_DB` | Redis 认证与库号 |
| `RABBITMQ_URL` 或 `RABBITMQ_HOST` + `PORT` + `USER` + `PASSWORD` | RabbitMQ 地址 |
| `ELASTICSEARCH_URL` | Elasticsearch 地址 |
| `JWT_SECRET` | **必填**，建议 ≥32 字符 |
| `JWT_EXPIRE_HOUR` | Token 有效期，默认 6 小时 |
| `MAIL_HOST` / `PORT` / `USERNAME` / `PASSWORD` / `FROM` | SMTP 发信配置（验证码邮件） |
| `UPLOAD_MODE` | 当前实现为 `local`（默认）；`oss` / `cos` 为预留，尚未接入 |
| `UPLOAD_LOCAL_PATH` | 本地存储目录，默认 `./uploads` |
| `UPLOAD_MAX_SIZE_MB` | 单文件大小上限，默认 100 |
| `AUTO_MIGRATE_ON_STARTUP` | 默认 `true`；多副本 / 生产建议设为 `false` 并使用 `cmd/migrate` |

必填项校验：`jwt.secret`、`database.host`、`database.user`、`database.dbname`，缺失时进程直接退出。

## 常用命令

```bash
go run ./cmd/server                 # 启动 API 服务（:8080）
go run ./cmd/migrate                # 手动执行 AutoMigrate + 内置角色/页面
go run ./cmd/seed                   # 创建管理员（读取 SEED_ADMIN_*）
go run ./cmd/reindex --batch 100    # 全量回填 ES，支持 --config 指定配置
go test ./...                       # 单元测试
go vet ./...                        # 静态检查
```

## API 约定

- 统一前缀 `/api/v1`，统一响应体：

  ```json
  { "code": 200, "flag": true, "message": "success", "data": {} }
  ```

- 分页返回 `{ records, count, current, size }`。
- 登录后在请求头携带 `Authorization: Bearer <token>`。
- 上传文件通过 `/uploads/*` 静态访问，开发环境由前端 rewrites 反代。

### 路由分组

| 分组 | 鉴权 | 主要接口 |
| --- | --- | --- |
| 公开 | 无 | `/health`、文章列表 / 详情 / 归档 / 搜索 / 条件筛选、分类、标签、评论列表、说说、友链、留言（GET / POST）、站点配置、关于我、登录 / 注册 / 验证码、`/music/enabled` |
| 登录用户 | JWT | 修改密码、文章点赞、发表评论、说点赞、WebSocket `/chat` |
| 管理后台 | JWT + Casbin | `/admin/*`：仪表盘、文章、分类、标签、说说、评论、留言、相册 / 照片、音乐、友链、页面、站点配置、操作日志 |

限流（Redis 滑动窗口）：登录 5 次/分钟、注册 3 次/分钟、发送验证码 10 次/小时。

### 点唱机

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/music/enabled` | 公开，返回启用曲目（`status=1`，按 `sort`、`id` 升序） |
| GET | `/api/v1/admin/music` | 后台分页列表，支持 `keyword` 搜索歌名 / 歌手 |
| POST | `/api/v1/admin/music` | 新增或更新曲目（带 `id` 即更新） |
| DELETE | `/api/v1/admin/music` | 按 ID 数组批量删除 |
| POST | `/api/v1/admin/music/audio` | 上传音频（multipart 字段名 `file`），返回可访问 URL |

曲目字段：`musicName`（必填）、`musicAuthor`、`musicUrl`（必填）、`cover`、`sort`、`status`（1 启用 / 0 停用）。

## 权限

- JWT 中间件校验签名、过期时间与 `token_version`；修改密码后旧 token 自动失效。
- Casbin 策略存放在 PostgreSQL，管理员内置策略为 `(admin, /*, .*)`。
- 未登录返回 401，已登录但无权限返回 403。
- 用户 / 角色 / 菜单 / 资源的部分管理接口目前为占位实现（返回 501），不影响核心业务。

## 上传

- 图片：扩展名白名单（jpg / jpeg / png / gif / webp，不含 svg）+ `http.DetectContentType` 嗅探。
- 音频（点唱机）：`mp3` / `m4a` / `aac` / `ogg` / `oga` / `opus` / `wav` / `flac` / `webm`，
  额外拒绝 `text/*`、HTML、SVG 等伪装内容。
- 文件名会被清洗为安全名称并追加随机后缀；默认上限 100 MB。
- 当前只实现本地存储（`local`），`oss` / `cos` 尚未接入。
- 本地模式下由 Gin `r.Static("/uploads", UPLOAD_LOCAL_PATH)` 提供访问，支持 Range 请求。

## 测试

服务层测试使用 SQLite 内存库，不依赖 PostgreSQL / Redis：

```bash
go test ./...
go vet ./...
```

## Docker

```bash
# 在仓库根目录
docker compose up -d --build backend

# 首次创建管理员
docker compose exec -e SEED_ADMIN_EMAIL=admin@example.com \
                    -e SEED_ADMIN_PASSWORD='your-password' \
                    backend ./seed
```

镜像内同时包含 `server` / `migrate` / `seed` / `reindex` 四个可执行文件，
启动时读取由 `config.docker.yaml` 复制的 `config.yaml`，并暴露 `8080`。

生产部署（Nginx + HTTPS + 自动发布 + 备份回滚）见 [`../deploy/DEPLOY.md`](../deploy/DEPLOY.md)。
