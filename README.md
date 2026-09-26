<div align="center">

# 🌙 Moon Blog

**一个开箱即用、支持后台管理的全栈个人博客系统**

文章 · 分类 · 标签 · 置顶 · 全文搜索 · 评论 · 相册 · 说说 · 留言 · 友链 · Markdown 编辑器 · WebSocket 聊天

[English](#features) · [简体中文](#功能一览) · [文档](docs/) · [在线演示](#)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go&logoColor=white)](https://go.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![Deploy](https://img.shields.io/badge/Deploy-Actions-blue?logo=githubactions&logoColor=white)](.github/workflows/deploy.yml)

---

</div>

## 📑 目录

- [🌙 Moon Blog](#-moon-blog)
  - [📑 目录](#-目录)
  - [✨ 功能一览](#-功能一览)
  - [🏗️ 架构](#️-架构)
  - [🧰 技术栈](#-技术栈)
  - [📁 项目结构](#-项目结构)
  - [🚀 快速开始](#-快速开始)
    - [前置条件](#前置条件)
    - [Docker 一键启动(推荐)](#docker-一键启动推荐)
    - [本地开发](#本地开发)
  - [⚙️ 环境变量](#️-环境变量)
  - [🧪 测试](#-测试)
  - [📜 常用脚本](#-常用脚本)
  - [🚢 部署](#-部署)
  - [🤝 贡献指南](#-贡献指南)
  - [📚 文档](#-文档)
  - [📄 License](#-license)
  - [🙏 致谢](#-致谢)

---

## ✨ 功能一览

### 📝 内容管理

| 模块 | 说明 |
| --- | --- |
| **文章** | CRUD、置顶、封面图、导入/导出(Markdown) |
| **分类 & 标签** | 多级分类,标签自动联想 |
| **说说(Talks)** | 轻量短内容流 |
| **留言板** | 访客可匿名提交,管理员审核 |
| **友链** | 自定义链接 + 独立页面管理 |
| **相册** | 相册/照片双层管理,瀑布流 + 灯箱 |

### 🔐 认证与权限

- **JWT 认证**(`golang-jwt/jwt/v5`),登录 / 注册 / 邮箱验证码
- **Casbin RBAC** 细粒度权限(用户 / 角色 / 菜单 / 资源 四级)
- 限流防爆破(基于 Redis):注册 3/min · 登录 5/min · 邮箱 10/hour
- Token Version 控制:管理员重置密码立即使所有旧 JWT 失效

### 🔍 搜索与实时

- **Elasticsearch**(IK 分词) 全文搜索,支持高亮、按条件筛选
- **RabbitMQ** 异步消息队列:邮件通知、评论订阅、Maxwell CDC 同步文章到 ES
- **WebSocket** 在线聊天室(需登录)

### 🎨 前台与体验

- 🎭 Hero 区置顶封面 + 精选文章置顶
- 📱 完全响应式(shadcn/ui + Radix Primitives)
- 🌓 深色 / 浅色主题(`next-themes`)
- 🎵 全局音乐播放器(`React Context` + `localStorage`)
- 🖼️ 图片灯箱(`yet-another-react-lightbox`)
- 🧮 Markdown 编辑器(`@uiw/react-md-editor`),自动保存
- 📊 数据可视化(`recharts`):访问量、点赞、分类分布

### 🛠️ 后台(`/admin`)

- 仪表盘统计、文章/分类/标签/说说/评论/留言/友链/相册/页面 9 大模块
- 站点配置(标题、公告、关于页、SEO)
- 操作日志记录

---

## 🏗️ 架构

```
            Internet
                │
        ┌───────▼────────┐
        │  Nginx (容器)  │  :80 :443
        │  HTTPS 终止    │
        └───┬────────┬───┘
       /api │        │ /
       /uploads     │
   ┌────────▼─────┐  ┌▼────────────┐
   │  Go Backend  │  │  Next.js    │
   │  Gin :8080   │  │  Standalone │
   └──┬──┬──┬──┬──┘  └─────────────┘
      │  │  │  │
      ▼  ▼  ▼  ▼
     PG  Redis  MQ  Elasticsearch
        (RabbitMQ) (含 IK 分词)
```

**请求链路**

1. 浏览器请求 `https://moon.example.com/...`
2. Nginx 按路径反代:`/api/*` → backend,`/uploads/*` → backend,`/_*next/*` → frontend,其它 → frontend
3. Next.js 通过 `rewrites` 将 `/api/*` 同源代理到 backend 容器(避免 CORS)
4. Backend 校验 JWT → 查 RBAC → 业务处理
5. 评论 / 邮件事件通过 RabbitMQ 异步消费

更多架构细节参见 [`docs/architecture/`](docs/architecture/)。

---

## 🧰 技术栈

### 前端 (`frontend/`)

| 类别 | 技术 |
|---|---|
| 框架 | [Next.js 16](https://nextjs.org)(App Router · Standalone 输出) + [React 19](https://react.dev) |
| 语言 | TypeScript 5 |
| 样式 | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (基于 [Base UI](https://base-ui.com)) |
| 状态 | [Zustand](https://github.com/pmndrs/zustand) · [react-hook-form](https://react-hook-form.com) · [Zod](https://zod.dev) |
| 数据 | [TanStack Table](https://tanstack.com/table) · [recharts](https://recharts.org) |
| 动效 | [Framer Motion](https://www.framer.com/motion) |
| 工具 | `lucide-react` 图标 · `react-markdown` · `highlight.js` · `sonner` 提示 |
| 测试 | [Vitest](https://vitest.dev) · [Playwright](https://playwright.dev) E2E · [Testing Library](https://testing-library.com) |

### 后端 (`backend/`)

| 类别 | 技术 |
|---|---|
| 语言 | [Go 1.25](https://go.dev) |
| Web | [Gin](https://gin-gonic.com) v1.12 |
| ORM | [GORM](https://gorm.io) v1.31(`gorm.io/driver/postgres`) |
| 认证 | [JWT v5](https://github.com/golang-jwt/jwt) · `golang.org/x/crypto`(bcrypt) |
| 权限 | [Casbin v2](https://casbin.io) + `gorm-adapter/v3` |
| 队列 | [RabbitMQ](https://www.rabbitmq.com) `amqp091-go` |
| 缓存 | [Redis](https://redis.io) `go-redis/v9`(限流、token 版本) |
| 搜索 | [Elasticsearch v7](https://www.elastic.co) `go-elasticsearch/v7` |
| 实时 | WebSocket (`gorilla/websocket`) |
| 配置 | [Viper](https://github.com/spf13/viper) |
| 邮件 | SMTP(支持 QQ / 163 / 自建) |

### 基础设施

PostgreSQL 16 · Redis 7 · RabbitMQ 3.13 (Management) · Elasticsearch 7.17 (IK Analyzer)

---

## 📁 项目结构

```
moon/
├── frontend/                # Next.js 前端
│   ├── src/
│   │   ├── app/
│   │   │   ├── (blog)/      # 公开路由组(Hero / 文章 / 归档 / 关于 / 友链)
│   │   │   ├── (admin)/     # 后台路由组
│   │   │   └── (auth)/      # 登录 / 注册 / 找回密码
│   │   ├── components/      # ui 基元 + blog 复合组件 + 编辑器 + 上传
│   │   ├── lib/             # API 客户端 + 工具函数 + 类型
│   │   ├── hooks/           # 自定义 hooks
│   │   └── stores/          # Zustand store
│   ├── e2e/                 # Playwright E2E
│   └── Dockerfile
│
├── backend/                 # Go 后端
│   ├── cmd/
│   │   ├── server/          # 主服务(Gin HTTP)
│   │   ├── migrate/         # 手动 schema 迁移
│   │   ├── seed/            # 首次部署创建/重置管理员
│   │   └── reindex/         # ES 重建索引
│   ├── internal/
│   │   ├── handler/         # Gin handler & 路由
│   │   ├── service/         # 业务逻辑
│   │   ├── repository/      # 数据访问
│   │   ├── model/           # GORM 模型
│   │   ├── middleware/      # JWT / RBAC / CORS / 限流 / DB 注入
│   │   ├── pkg/             # es / mq / mail / oauth 等基础设施
│   │   └── config/          # Viper 配置
│   ├── config.yaml          # 本地配置
│   ├── config.docker.yaml   # 容器内配置
│   └── Dockerfile
│
├── deploy/                  # 生产部署
│   ├── docker-compose.prod.yml   # 生产 compose(Nginx 唯一对外端口)
│   ├── nginx/                    # 反代配置 + snippets + SSL 模板
│   ├── elasticsearch/Dockerfile  # 自定义 ES 镜像(预装 IK)
│   ├── DEPLOY.md                 # 完整部署文档
│   └── cleanup-docker.sh
│
├── docs/                    # 架构 / 阶段交付文档
│   ├── architecture/
│   └── tasks/phase-1..5/
│
├── .github/workflows/
│   ├── ci.yml               # 推送 / PR 触发:lint / test / build
│   └── deploy.yml           # 推送 main → SSH 自动部署
│
├── docker-compose.yml       # 开发 compose(含 backend + frontend)
├── .env.example             # 环境变量模板
├── LICENSE                  # MIT
└── README.md                # ← 你正在看这个
```

---

## 🚀 快速开始

### 前置条件

- **Docker** 20+ 与 **Docker Compose** v2(`docker compose version`)
- (本地开发) **Go** 1.25+ · **Node.js** 22+ 或 **Bun**(可选)

### Docker 一键启动(推荐)

```bash
# 1. 克隆
git clone https://github.com/tajiaoyezi/moon.git
cd moon

# 2. 生成密钥(至少 32 字符)
export JWT_SECRET="$(openssl rand -base64 48)"

# 3. 准备 .env(复制模板后填入 JWT_SECRET)
cp .env.example .env
# 把上面的 JWT_SECRET 粘贴进 .env

# 4. 一键起所有服务
docker compose up -d --build

# 5. 等待所有容器 healthy(~30 秒)
docker compose ps
```

启动后访问:

| 地址 | 说明 |
|---|---|
| `http://localhost:3000` | 🌙 博客前台 |
| `http://localhost:8080/health` | ⚙️ 后端健康检查 |
| `http://localhost:9200` | 🔍 Elasticsearch |
| `http://localhost:15672` | 📬 RabbitMQ 控制台(`guest` / `guest`) |

**首次部署后建议:**

```bash
# 重建 ES 索引(可选,文章发布后也会自动同步)
docker compose exec backend ./reindex

# 创建管理员账号(密码至少 8 位)
docker compose exec -e SEED_ADMIN_EMAIL=admin@example.com \
                    -e SEED_ADMIN_PASSWORD='your-strong-password' \
                    backend ./seed
```

### 本地开发

适合只动前端代码,或者后端单独调试。

#### ① 启动依赖服务

`docker-compose.yml` 里除了 `backend` 和 `frontend`,其它服务都是通用基础设施,可只拉它们:

```bash
docker compose up -d postgres redis rabbitmq elasticsearch
```

#### ② 启动后端

```bash
cd backend
cp config.yaml config.local.yaml   # 可选:覆盖本地参数

export JWT_SECRET="$(openssl rand -base64 48)"
export AUTO_MIGRATE_ON_STARTUP=true

go run ./cmd/server
# → http://localhost:8080
```

> 首次启动会自动迁移 schema。多副本 / 生产部署请关闭该选项,改用 `go run ./cmd/migrate` 手动迁移。

#### ③ 启动前端

```bash
cd frontend
npm install            # 或 bun install / pnpm install
npm run dev            # → http://localhost:3000
```

前端通过 `next.config.ts` 的 `rewrites` 把 `/api/*` 和 `/uploads/*` 反代到 `BACKEND_URL`(默认 `http://localhost:8080`),浏览器只看到同源路径,**避免 CORS**。

如需指向其它后端地址:

```bash
echo "BACKEND_URL=http://localhost:8080" > frontend/.env.local
```

---

## ⚙️ 环境变量

| 变量 | 必填 | 默认 | 说明 |
|---|---|---|---|
| `JWT_SECRET` | ✅ | — | 签名密钥,**至少 32 字符**。生产环境务必替换 |
| `AUTO_MIGRATE_ON_STARTUP` | ❌ | `true` | 是否随 server 启动执行 schema 迁移 |
| `SEED_ADMIN_EMAIL` | 仅 seed | — | 首次创建管理员邮箱 |
| `SEED_ADMIN_PASSWORD` | 仅 seed | — | 管理员密码,**至少 8 位** |
| `BACKEND_URL` | 前端 | `http://localhost:8080` | Next rewrites 目标地址 |
| `NEXT_PUBLIC_API_BASE` | 前端 | `/api/v1` | 浏览器侧 API 基础路径 |
| `POSTGRES_USER` | 生产 ✅ | `blog` | PostgreSQL 用户 |
| `POSTGRES_PASSWORD` | 生产 ✅ | — | PostgreSQL 密码(强校验:`:?`) |
| `POSTGRES_DB` | 生产 ✅ | `blog` | 数据库名 |
| `RABBITMQ_USER` | 生产 ✅ | `guest` | RabbitMQ 用户 |
| `RABBITMQ_PASSWORD` | 生产 ✅ | — | RabbitMQ 密码 |

完整可配置项见 [`backend/config.yaml`](backend/config.yaml):
- `server` — 端口 / 模式(`debug` / `release` / `test`)
- `database` — Postgres 连接
- `redis` — 缓存地址 + DB 编号
- `rabbitmq` — AMQP URL
- `elasticsearch` — 节点地址(可多个)
- `jwt` — 密钥 + 过期时间
- `mail` — SMTP(`host` / `port` / `username` / `password` / `from`)
- `upload` — `mode`(`local` / `oss` / `cos`)+ 最大体积 + 本地路径

---

## 🧪 测试

### 前端

```bash
cd frontend
npm run test           # Vitest 单元测试 (watch)
npm run test:run       # 单次跑
npm run test:coverage  # 覆盖率报告
npm run test:e2e       # Playwright E2E
npm run lint           # ESLint
```

E2E 用例覆盖:

- `blog-home.spec.ts` — 博客首页 + 文章列表
- `blog-article.spec.ts` — 文章详情 + 评论
- `blog-pages.spec.ts` — 归档 / 友链 / 关于
- `blog-theme.spec.ts` — 主题切换
- `admin-login.spec.ts` — 后台登录
- `admin-crud.spec.ts` — 后台 CRUD 流程
- `api.spec.ts` — 后端 API 直连

### 后端

```bash
cd backend
go vet ./...
go test ./...
```

包含 JWT、RBAC、限流、CommentService、ArticleService、BlogInfoService、OAuth state 等单元测试。

---

## 📜 常用脚本

### 前端

```bash
npm run dev          # 开发服务
npm run build        # 生产构建(standalone)
npm run start        # 运行构建产物
npm run lint         # ESLint
npm run test         # Vitest 单元测试
npm run test:e2e     # Playwright E2E
```

### 后端

```bash
go run ./cmd/server     # 主服务
go run ./cmd/migrate    # 手动 schema 迁移
go run ./cmd/seed       # 创建/重置管理员
go run ./cmd/reindex    # 重建 ES 索引
```

### Docker

```bash
# 一键清理(释放磁盘)
./deploy/cleanup-docker.sh

# 查看所有容器 + 健康状态
docker compose ps

# 看日志
docker compose logs -f backend frontend
```

---

## 🚢 部署

> 完整生产部署文档(含 HTTPS / Nginx / 备份 / 回滚 / GitHub Actions):[`deploy/DEPLOY.md`](deploy/DEPLOY.md)

**TL;DR**:

1. 准备一台 2C2G+ 的 Linux 服务器(Ubuntu 22.04 / Debian 12 / CentOS 9)
2. `git clone` 仓库到 `/opt/moon`,复制 `.env.example` 为 `.env` 并填入强密钥
3. `docker compose -f deploy/docker-compose.prod.yml up -d --build`
4. `... exec backend ./migrate` → `... exec backend ./seed`
5. 配置 GitHub Secrets(`DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_SSH_KEY` / `DEPLOY_PATH`),后续 `git push origin main` 自动部署

**架构拓扑**

```
            ┌────────────────────────┐
Internet ──►│ Nginx (容器, 唯一对外) │  :80 / :443
            └────┬──────────────┬────┘
        /api/*   │              │  /
        /uploads*│              │
       ┌─────────▼──┐    ┌──────▼────────┐
       │ Backend    │    │  Frontend     │
       │ :8080      │    │  :3000        │
       └─┬──┬──┬──┬─┘    └───────────────┘
         │  │  │  │
         ▼  ▼  ▼  ▼
       PG  Redis RabbitMQ ES(IK)
```

**自动部署** [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

`main` 分支 push → 触发 `Deploy` workflow → SSH 到服务器 → `git reset --hard` → 构建 → 迁移 → seed → 重启 → 健康检查。

并发控制:`concurrency: deploy-${{ github.ref }}` 保证同一分支串行。

---

## 🤝 贡献指南

欢迎任何形式的贡献 — Issue、PR、文档改进、Bug 报告都欢迎。

### 开发流程

1. Fork 本仓库
2. 创建特性分支:`git checkout -b feat/your-feature`
3. 提交前运行:**前端** `npm run lint && npm run test:run`,**后端** `go vet ./... && go test ./...`
4. 推送并创建 PR

### 提交规范(Conventional Commits)

```
feat: 新增 xxx 功能
fix: 修复 xxx 问题
docs: 文档修订
refactor: 重构(无新功能)
test: 测试相关
chore: 构建/工具链变更
```

### 代码风格

- **Go**: `gofmt` + `go vet`,遵循 [Effective Go](https://golang.org/doc/effective_go)
- **TypeScript**: [Next.js ESLint 配置](https://nextjs.org/docs/app/building-your-application/configuring/eslint)
- 所有 PR 必须通过 CI(`ci.yml`)才可合并

### 安全

发现安全问题请**不要**公开 Issue,请邮件至项目所有者邮箱(见 GitHub Profile)。

---

## 📚 文档

| 路径 | 内容 |
|---|---|
| [`deploy/DEPLOY.md`](deploy/DEPLOY.md) | 生产部署完整指南(nginx / HTTPS / 备份 / 回滚 / GitHub Actions) |
| [`docs/architecture/`](docs/architecture/) | 架构图、启动流程、数据模型 |
| [`docs/tasks/phase-1..5/`](docs/tasks/) | 各阶段交付清单 |
| [`frontend/README.md`](frontend/README.md) | 前端开发说明 |
| [`backend/config.yaml`](backend/config.yaml) | 后端配置项详解 |

---

## 📄 License

本项目基于 [MIT License](LICENSE) 开源。

```
MIT License
Copyright (c) 2024 Blog Go Next Contributors
```

---

## 🙏 致谢

本博客参考了大量优秀开源博客项目,在此向作者们致以敬意:

- [Vanessa219/Blog](https://github.com/Vanessa219/Blog) — 早期 UI/UX 设计参考
- [halo-dev/halo](https://github.com/halo-dev/halo) — 后台权限模型参考
- [NodeSeek](https://www.nodeseek.com/) — 评论 / 邮件 / 社区运营思路

也感谢以下开源项目为本博客奠定了基础:

[Next.js](https://nextjs.org) · [React](https://react.dev) · [Tailwind CSS](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com) · [Gin](https://gin-gonic.com) · [GORM](https://gorm.io) · [Casbin](https://casbin.io) · [PostgreSQL](https://www.postgresql.org) · [Redis](https://redis.io) · [RabbitMQ](https://www.rabbitmq.com) · [Elasticsearch](https://www.elastic.co)

---

<div align="center">

如果这个项目对你有帮助,欢迎 ⭐ Star 支持一下!

**Made with ❤️ by Moon Contributors**

</div>
