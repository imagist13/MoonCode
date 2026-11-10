<div align="center">

# 🌙 Moon Blog

**一个自己写的全栈个人博客 —— 极简排版的前台，配上够用的后台**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go&logoColor=white)](https://go.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)

</div>

![首页](docs/screenshots/home.png)

## 页面预览

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/article.png" alt="文章详情" /></td>
    <td width="50%"><img src="docs/screenshots/archives.png" alt="归档" /></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/message.png" alt="留言板" /></td>
    <td><img src="docs/screenshots/links.png" alt="友情链接" /></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/login.png" alt="登录" /></td>
    <td><img src="docs/screenshots/admin-login.png" alt="后台登录" /></td>
  </tr>
</table>

<img src="docs/screenshots/admin.png" alt="后台仪表盘" />

<img src="docs/screenshots/player.png" alt="蜘蛛点唱机" />

## 功能

- **前台**：Hero 推荐、文章列表、分类 / 标签筛选、归档、说说、留言板、友链、相册、全文搜索
- **阅读体验**：Markdown 渲染与代码高亮、文章目录、图片灯箱、深浅主题、蜘蛛点唱机
- **后台**：仪表盘、Markdown 文章编辑、评论 / 留言审核、分类标签、相册、音乐管理、站点配置、操作日志
- **服务端**：JWT + Casbin RBAC、Redis 限流、RabbitMQ 异步任务、Elasticsearch 搜索、WebSocket 聊天

## 技术栈

| | |
| --- | --- |
| 前端 | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Base UI · Phosphor Icons |
| 后端 | Go · Gin · GORM · Casbin · JWT |
| 数据 | PostgreSQL 16 · Redis 7 · Elasticsearch 7 · RabbitMQ |

## 架构

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

> 本地开发不经过 Nginx：浏览器访问 Next.js（`:3000`），由 `rewrites` 把 `/api/*` 转发到 Go 服务（`:8080`）。

## 快速开始

### Docker 一键启动

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

### 本地开发

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

前端通过 `next.config.ts` 的 rewrites 把 `/api/*` 代理到 `BACKEND_URL`（默认 `http://localhost:8080`），本地开发不用处理跨域。

## 项目结构

```
MoonCode/
├── frontend/    # Next.js 16：博客前台 + 管理后台（见 frontend/README.md）
├── backend/     # Go + Gin：API、权限、搜索、消息队列（见 backend/README.md）
├── scripts/     # 开发脚本：页面截图（见 scripts/README.md）
├── deploy/      # Nginx 配置、生产 compose、部署文档
└── docker-compose.yml
```

## 部署

生产部署（Nginx + HTTPS + 自动发布 + 备份回滚）见 [`deploy/DEPLOY.md`](deploy/DEPLOY.md)。

## License

[MIT](LICENSE)
