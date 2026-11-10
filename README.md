<div align="center">

# 🌙 Moon Blog

**简约不简单 —— 一个能直接部署上线，也值得从头读懂的全栈个人博客**

[在线演示](https://ideast.top) · [简体中文](README.md) / [English](README.en.md) · [快速开始](#快速开始) · [部署](#部署) · [更新日志](CHANGELOG.md)

[![Live Demo](https://img.shields.io/badge/Demo-ideast.top-12120f?style=flat-square)](https://ideast.top)
[![License: MIT](https://img.shields.io/badge/License-MIT-12120f?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?style=flat-square&logo=go&logoColor=white)](https://go.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)

</div>

![Moon Blog 演示：首页浏览与深浅主题切换](docs/screenshots/demo.gif)

## 为什么是 Moon Blog

**视觉克制。** 暖纸底色、发丝分隔线、排版先行的前台，配上同一套设计语言的后台。
没有满屏渐变、浮卡和胶囊标签，把注意力留给文字本身。

**部署不折腾。** 前端、后端、PostgreSQL、Redis、RabbitMQ、Elasticsearch 全在
`docker-compose.yml` 里，填好 `.env` 一条命令起全套；生产环境的 Nginx、HTTPS、
发布与回滚脚本也一并放在仓库里。

**适合学习。** 不是只有接口桩的脚手架：JWT + Casbin 权限、Redis 限流、
RabbitMQ 异步邮件、Maxwell CDC 同步 Elasticsearch、WebSocket 聊天，
每一条链路都在真实业务里跑。代码分层清晰，可以按模块读，也可以直接拿去做自己的博客。

## 功能

**博客前台**

- 首页 Hero 推荐、文章流、分类 / 标签筛选、归档、说说、留言板、友链、关于
- Markdown 渲染与代码高亮、文章目录、图片灯箱、全文搜索
- 深浅主题（像素开关）、蜘蛛点唱机、响应式布局
- 留言板与评论区，文章浏览量统计

**管理后台**

- 仪表盘：文章 / 用户 / 留言 / 访问量概览，近 7 天访问趋势、分类分布、最新文章
- Markdown 文章编辑、草稿与发布、分类与标签管理
- 评论、留言、说说、相册、点唱机曲目管理
- 站点配置（站点信息、社交链接、关于页）、操作日志

**服务端**

- JWT 登录态 + Casbin RBAC 角色权限
- Redis 滑动窗口限流、验证码、token 版本、点赞计数
- RabbitMQ 异步邮件、Elasticsearch 全文搜索、Maxwell CDC 增量同步
- WebSocket 实时聊天、文件上传（本地 / OSS / COS）

## 技术栈

| | |
| --- | --- |
| 前端 | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Base UI · TanStack Table · Zustand |
| 后端 | Go 1.26 · Gin · GORM · Casbin · JWT |
| 数据 | PostgreSQL 16 · Redis 7 · Elasticsearch 7 · RabbitMQ |
| 工程 | Docker Compose · Nginx · Playwright / Vitest · GitHub Actions |

## 页面预览

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/home.png" alt="首页" /></td>
    <td width="50%"><img src="docs/screenshots/article.png" alt="文章详情" /></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/archives.png" alt="归档" /></td>
    <td><img src="docs/screenshots/message.png" alt="留言板" /></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/links.png" alt="友情链接" /></td>
    <td><img src="docs/screenshots/player.png" alt="蜘蛛点唱机" /></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/admin.png" alt="后台仪表盘" /></td>
    <td><img src="docs/screenshots/admin-login.png" alt="后台登录" /></td>
  </tr>
</table>

## 快速开始

### 方式一：Docker 一键启动（推荐）

需要 Docker 与 Docker Compose。

```bash
git clone https://github.com/imagist13/MoonCode.git
cd MoonCode

cp .env.example .env          # 填好 JWT_SECRET、数据库密码等
docker compose up -d --build
```

启动后访问：

- 博客前台：<http://localhost:3000>
- 后端健康检查：<http://localhost:8080/health>
- RabbitMQ 控制台：<http://localhost:15672>（guest / guest）

首次使用需要创建管理员：

```bash
docker compose exec -e SEED_ADMIN_EMAIL=admin@example.com \
                    -e SEED_ADMIN_PASSWORD='your-password' \
                    backend ./seed
```

然后从 `/admin/login` 登录后台。

### 方式二：本地开发

```bash
# 只启动依赖服务
docker compose up -d postgres redis rabbitmq elasticsearch

# 后端（:8080）
cd backend
JWT_SECRET="$(openssl rand -base64 48)" go run ./cmd/server

# 前端（:3000）
cd frontend
bun install && bun run dev
```

前端通过 `next.config.ts` 的 rewrites 把 `/api/*` 代理到 `BACKEND_URL`（默认
`http://localhost:8080`），本地开发不用处理跨域。

只改前端时，可以不启动 Go 和数据库，直接用仓库里的 Mock 后端：

```bash
cd frontend
bun run mock    # 终端 1：Mock API（:8080）
bun run dev     # 终端 2：Next 开发服务器（:3000）
```

默认账号：任意邮箱 + 密码 `12345678`。

## 部署

演示站点 <https://ideast.top> 即由本仓库部署。

生产部署的完整步骤（服务器准备、Nginx + HTTPS、自动发布、数据库备份与回滚）
见 [`deploy/DEPLOY.md`](deploy/DEPLOY.md)。

## 用它学习

仓库按「前端 → 后端 → 中间件」分层，每条主链路都能从入口一路读到实现：

| 想了解 | 从这里开始 |
| --- | --- |
| 一次请求怎么走 | `frontend/src/lib/api.ts` → `frontend/next.config.ts`（rewrites） → `backend/internal/handler/router.go` |
| 登录与接口权限 | `backend/internal/middleware/jwt.go`、`rbac.go`；`backend/internal/service/auth.go` |
| 文章查询与搜索 | `backend/internal/service/article_query.go`、`article_search.go` |
| Elasticsearch 增量同步 | `backend/internal/service/article_search.go`（Maxwell CDC 消费者）、`backend/cmd/reindex` |
| 异步邮件 | `backend/internal/pkg/mq/rabbitmq.go`、`backend/internal/pkg/mail` |
| 实时聊天 | `backend/internal/handler/websocket.go` |
| 后台表格与设计系统 | `frontend/src/components/data-table/`、`frontend/src/app/globals.css` |
| 页面截图 / 演示视频 | `scripts/screenshots.mjs`、`scripts/demo.mjs` |

架构：

```mermaid
flowchart LR
    subgraph Client["客户端"]
        User([浏览器])
    end

    subgraph Edge["入口"]
        Nginx["Nginx<br/>HTTPS · 反向代理"]
    end

    subgraph App["应用层"]
        FE["Next.js 16<br/>博客前台 · 管理后台"]
        API["Go / Gin API<br/>JWT · RBAC"]
    end

    subgraph Data["数据与中间件"]
        PG[("PostgreSQL<br/>文章 · 用户 · 评论")]
        Redis[("Redis<br/>缓存 · 限流")]
        MQ[("RabbitMQ<br/>邮件 · 异步任务")]
        ES[("Elasticsearch<br/>全文搜索")]
    end

    User --> Nginx
    Nginx -->|"/"| FE
    Nginx -->|"/api/*"| API
    FE -.->|"rewrites 代理 /api/*"| API
    API --> PG
    API --> Redis
    API --> MQ
    API --> ES
    API -.->|"WebSocket 聊天"| User
```

> 本地开发不经过 Nginx：浏览器访问 Next.js（`:3000`），由 `rewrites` 把
> `/api/*` 转发到 Go 服务（`:8080`）。

## 项目结构

```
MoonCode/
├── frontend/    # Next.js 16：博客前台 + 管理后台（见 frontend/README.md）
├── backend/     # Go + Gin：API、权限、搜索、消息队列（见 backend/README.md）
├── scripts/     # 开发脚本：页面截图、演示 GIF（见 scripts/README.md）
├── deploy/      # Nginx 配置、生产 compose、部署文档
└── docker-compose.yml
```

## License

[MIT](LICENSE)
