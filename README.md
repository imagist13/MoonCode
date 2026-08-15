# Moon · 个人博客

一个支持文章管理、分类、标签、置顶、评论、搜索的全栈博客系统。

- **前端**：[Next.js 16](https://nextjs.org) + React 19 + Tailwind v4（`frontend/`）
- **后端**：[Go](https://go.dev) 1.25 + Gin + GORM + Casbin（`backend/`）
- **基础设施**：PostgreSQL · Redis · RabbitMQ · Elasticsearch（通过 `docker compose` 一键起）

---

## 目录结构

```
moon/
├── frontend/              # Next.js 应用
│   ├── src/app/           # 路由：(blog) 公开页 / (admin) 后台 / api 路由
│   ├── src/components/    # 通用组件 + 博客专用组件
│   ├── public/            # 静态资源（Hero 图、字体等）
│   └── Dockerfile
│
├── backend/               # Go 后端
│   ├── cmd/
│   │   ├── server/        # 主服务（Gin）
│   │   ├── migrate/       # 手动 schema 迁移
│   │   ├── seed/          # 首次部署创建管理员
│   │   └── reindex/       # ES 重建索引
│   ├── config.yaml        # 本地配置
│   └── config.docker.yaml # 容器内配置
│
├── docs/                  # 设计与阶段文档
│   ├── architecture/      # 架构图、启动流程
│   └── tasks/phase-1..5/  # 各阶段交付清单
│
├── docker-compose.yml     # postgres + redis + rabbitmq + es + backend + frontend
├── .env.example           # 复制为 .env 并填入 JWT_SECRET 等
└── README.md
```

---

## 功能一览

- 文章 CRUD / 分类 / 标签 / 封面图上传
- 置顶文章（Hero 区引用置顶封面）
- 全文搜索（Elasticsearch）
- 评论 + 邮件通知（RabbitMQ 异步发送）
- JWT 鉴权 + Casbin RBAC 权限
- 后台管理：`/admin`
- 公开博客：`/`（文章列表、详情、归档、关于、友链）

---

## 快速启动（Docker）

> 最省事的方式。所有依赖一次性拉起来。

```bash
# 1. 准备密钥（至少 32 个字符的随机字符串）
cp .env.example .env
# 编辑 .env，替换 JWT_SECRET、SEED_ADMIN_PASSWORD

# 2. 启动
docker compose up -d --build

# 3. 等所有服务 healthy 后，访问
#    - 博客：   http://localhost:3000
#    - 后端：   http://localhost:8080
#    - ES 面板：http://localhost:9200
#    - MQ 面板：http://localhost:15672  (guest/guest)

# 4.（可选）重建 ES 索引
docker compose exec backend ./reindex

# 5.（可选）创建/重置管理员账号
docker compose exec -e SEED_ADMIN_EMAIL=admin@example.com \
                       -e SEED_ADMIN_PASSWORD='your-password' \
                       backend ./seed
```

---

## 本地开发（不带 Docker）

适合只动前端代码、或者后端单独调试的场景。

### 1) 启动依赖服务

`docker-compose.yml` 里除了 `backend` 和 `frontend`，其它服务都是通用的基础设施，可以只拉它们：

```bash
docker compose up -d postgres redis rabbitmq elasticsearch
```

### 2) 启动后端

```bash
cd backend
cp config.yaml config.local.yaml   # 可选：覆盖本地参数

export JWT_SECRET="$(openssl rand -base64 48)"
export AUTO_MIGRATE_ON_STARTUP=true

go run ./cmd/server
# → http://localhost:8080
```

首次启动会自动迁移 schema（`AUTO_MIGRATE_ON_STARTUP=true`）。
生产/多副本部署请关闭该选项，改用 `go run ./cmd/migrate` 手动迁移。

### 3) 启动前端

```bash
cd frontend
bun install     # 或 npm / pnpm / yarn
bun run dev     # 或 npm run dev
# → http://localhost:3000
```

前端通过 `next.config.ts` 里的 `rewrites` 把 `/api/*` 和 `/uploads/*` 反代到 `BACKEND_URL`（默认 `http://localhost:8080`），浏览器只看到同源路径，避免 CORS。

如果想换后端地址：

```bash
echo "BACKEND_URL=http://localhost:8080" > frontend/.env.local
```

---

## 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `JWT_SECRET` | ✅ | 签名密钥，至少 32 字符。生产环境务必替换 |
| `AUTO_MIGRATE_ON_STARTUP` | ❌ | `true`/`false`，是否随 server 启动执行 schema 迁移 |
| `SEED_ADMIN_EMAIL` | 仅 seed | 首次创建管理员邮箱 |
| `SEED_ADMIN_PASSWORD` | 仅 seed | 管理员密码，至少 8 位 |
| `BACKEND_URL` | 前端 | Next rewrites 目标地址，本地默认 `http://localhost:8080` |

完整可配置项见 `backend/config.yaml`（server / database / redis / rabbitmq / elasticsearch / jwt / mail / upload）。

---

## 常用脚本

### 前端

```bash
bun run dev          # 开发服务
bun run build        # 生产构建
bun run start        # 运行构建产物
bun run lint         # ESLint
bun run test         # Vitest 单元测试（watch）
bun run test:run     # 单次跑测试
bun run test:coverage# 覆盖率
bun run test:e2e     # Playwright E2E
```

### 后端

```bash
go run ./cmd/server     # 主服务
go run ./cmd/migrate    # 手动 schema 迁移
go run ./cmd/seed       # 创建/重置管理员
go run ./cmd/reindex    # 重建 ES 索引
```

---

## 架构概览

```
┌────────────────────────────────────────────────────────┐
│  Browser                                              │
│   │                                                   │
│   ├── /        (blog)  Hero + 文章列表 + 归档 + 关于   │
│   ├── /admin   后台管理（JWT + Casbin RBAC）          │
│   └── /uploads 静态资源（被前端 rewrites 反代）        │
└────────────┬───────────────────────────────────────────┘
             │ /api/*  /uploads/*
┌────────────▼───────────────────────────────────────────┐
│  Next.js (standalone)                                 │
│  - rewrites → BACKEND_URL                             │
│  - 服务端组件直连后端                                  │
└────────────┬───────────────────────────────────────────┘
             │
┌────────────▼──────────────┬─────────────────────────────┐
│  Gin REST API             │   Middleware                │
│  - 文章 / 分类 / 标签      │   - JWT                     │
│  - 评论 / 上传            │   - Casbin RBAC             │
│  - 搜索 (ES)             │   - RequestID / 日志         │
└──────┬──────┬────────┬────┘
       │      │        │
   ┌───▼──┐ ┌─▼──┐ ┌──▼────┐ ┌──────────────┐
   │ PG   │ │ ES │ │ Redis │ │ RabbitMQ     │
   └──────┘ └───┘ └───────┘ └──────┬───────┘
                                    │ 评论 / 邮件事件
                              ┌─────▼─────┐
                              │ Consumer  │──→ SMTP
                              └───────────┘
```

更多细节见 `docs/architecture/`。

---

## 文档索引

- [`docs/architecture/`](docs/architecture/) — 架构图、启动流程、数据模型
- [`docs/tasks/`](docs/tasks/) — 各阶段（phase-1 ~ phase-5）交付清单
- [`frontend/README.md`](frontend/README.md) — 前端补充说明

---

## License

个人项目，仅供学习参考。