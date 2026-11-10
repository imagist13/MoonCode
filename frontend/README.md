# Frontend · Moon Blog

Moon Blog 的前端：极简排版的博客前台 + 管理后台，使用 Next.js 16 App Router 构建。

## 技术栈

| | |
| --- | --- |
| 框架 | Next.js 16（App Router）· React 19 · TypeScript |
| 样式 | Tailwind CSS v4 · shadcn / Base UI · Phosphor Icons |
| 组件 | TanStack Table · MDEditor · yet-another-react-lightbox |
| 状态 | Zustand（登录态）· next-themes（深浅主题）|
| 请求 | 原生 `fetch` 封装于 `src/lib/api.ts` |
| 测试 | Vitest · Playwright |

包管理器使用 **Bun**（`bun.lock`）。

## 本地开发

### 方式一：Mock 后端（推荐，无需 Go / 数据库）

```bash
cd frontend
bun install

# 终端 1：mock API（http://localhost:8080）
bun run mock

# 终端 2：Next 开发服务器（http://localhost:3000）
bun run dev
```

登录后台（<http://localhost:3000/admin/login>）：

- 邮箱：任意，例如 `test@qq.com`
- 密码：`12345678`（可用 `MOCK_ADMIN_PASSWORD` 覆盖）

Mock 覆盖了文章、分类、标签、评论、留言、说说、相册、音乐、友链、页面、站点配置、
认证等接口，写操作只改内存，重启即恢复。详细说明见 [`mock/README.md`](mock/README.md)。

### 方式二：连接真实后端

在仓库根目录启动依赖与 API：

```bash
docker compose up -d postgres redis rabbitmq elasticsearch

cd backend
JWT_SECRET="$(openssl rand -base64 48)" go run ./cmd/server
```

再启动前端：

```bash
cd frontend
bun install && bun run dev
```

在 `frontend/.env.local` 中写入（该文件不入库，本地已有则保持默认）：

```ini
NEXT_PUBLIC_API_BASE=/api/v1       # 浏览器侧相对路径
BACKEND_URL=http://localhost:8080  # Next rewrites 目标
```

首次使用真实后端需先创建管理员：

```bash
cd backend
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD='your-password' go run ./cmd/seed
```

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `BACKEND_URL` | `http://localhost:8080` | `next.config.ts` 中 `/api/*`、`/uploads/*` 的反代目标 |
| `NEXT_PUBLIC_API_BASE` | `/api/v1` | 浏览器侧 API 前缀 |
| `BASE_URL` | `http://localhost:3000` | Playwright 的 `baseURL` |

## 目录结构

```
frontend/
├── src/
│   ├── app/
│   │   ├── (blog)/                # 公开博客，共享 BlogLayout
│   │   │   ├── page.tsx           # 首页：Hero + 文章列表
│   │   │   ├── articles/[id]/     # 文章详情
│   │   │   ├── categories/        # 分类筛选
│   │   │   ├── tags/              # 标签筛选
│   │   │   ├── archives/          # 归档
│   │   │   ├── talks/             # 说说
│   │   │   ├── message/           # 留言板
│   │   │   ├── links/             # 友链
│   │   │   └── about/             # 关于
│   │   ├── (admin)/admin/         # 管理后台，独立 AdminLayout，需登录
│   │   ├── (auth)/                # 登录 / 注册 / 找回密码
│   │   └── layout.tsx             # 根布局（主题、字体、Toaster）
│   ├── components/
│   │   ├── blog/                  # Hero、ArticleCard、评论、目录、搜索等
│   │   ├── player/                # 蜘蛛点唱机（MusicPlayer / SpiderPlayerOverlay）
│   │   ├── dashboard/             # 后台侧边栏与顶栏
│   │   ├── editor/                # Markdown 编辑器、封面上传、标签输入
│   │   ├── data-table/            # 通用表格与防抖 hook
│   │   ├── upload/                # 拖拽上传与进度
│   │   ├── albums/ · about/ · auth/ · layout/ · lightbox/ · masonry/
│   │   ├── leibox/                # 视觉特效相关组件
│   │   └── ui/                    # shadcn / Base UI 基元
│   ├── hooks/                     # use-auto-save、use-markdown-editor、useSiteConfig 等
│   ├── lib/                       # api.ts、types.ts、utils.ts、validations/
│   └── stores/                    # auth（token + user，持久化）
├── mock/                          # 本地 Mock 后端（data.ts / server.ts）
├── e2e/                           # Playwright 用例
├── next.config.ts                 # standalone 输出 + rewrites
└── playwright.config.ts
```

## 路由

### 博客前台

| 路径 | 页面 |
| --- | --- |
| `/` | 首页：Hero、文章列表、侧栏、点唱机入口 |
| `/articles/[id]` | 文章详情：Markdown、标题目录、代码高亮、灯箱 |
| `/categories` · `/tags` | 按分类 / 标签筛选文章 |
| `/archives` | 按时间归档 |
| `/talks` | 说说列表 |
| `/message` | 留言板 |
| `/links` | 友情链接 |
| `/about` | 关于我 |
| `/login` · `/register` · `/forgot-password` | 登录 / 注册 / 找回密码 |

### 管理后台

| 路径 | 页面 |
| --- | --- |
| `/admin/login` | 后台登录（无后台框架） |
| `/admin` | 仪表盘 |
| `/admin/articles` · `/admin/articles/create` | 文章管理 / 写文章 |
| `/admin/categories` · `/admin/tags` | 分类 / 标签管理 |
| `/admin/comments` · `/admin/messages` | 评论 / 留言审核 |
| `/admin/talks` | 说说管理 |
| `/admin/albums` · `/admin/albums/[id]` | 相册与照片管理 |
| `/admin/music` | 点唱机曲目管理 |
| `/admin/settings` | 站点设置、关于我 |
| `/admin/logs` | 操作日志 |

后台登录态存于 Zustand（`localStorage`），未登录访问 `/admin/*` 会自动跳转 `/admin/login`。

## 与后端的约定

- 浏览器统一请求相对路径 `/api/v1/*`，由 `next.config.ts` 的 `rewrites` 转发到 `BACKEND_URL`，
  因此不存在跨域，也不会把宿主机地址打进 bundle。
- 上传文件通过 `/uploads/*` 访问，同样由 rewrites 反代。
- 响应体统一为 `{ code, flag, message, data }`；分页数据为 `{ records, count, current, size }`。
- 登录后请求头携带 `Authorization: Bearer <token>`，封装在 `src/lib/api.ts`。

## 点唱机

- 前台 `components/player/MusicPlayer.tsx` 请求公开接口 `/music/enabled`；
  列表为空时播放器自动隐藏，无需任何配置。
- 后台上传音频走 `POST /admin/music/audio`，曲目增删改查走 `/admin/music`，
  字段与后端一致：`musicName`、`musicAuthor`、`musicUrl`、`cover`、`sort`、`status`。
- 启用状态按 `sort` 升序播放；音频通过 `/uploads/*` 访问，支持拖动进度（Range）。
- Mock 模式下音频上传返回 SoundHelix 示例 MP3，封面使用动态生成的 `/uploads/*` 占位图。

## 测试

```bash
bun run test           # Vitest watch
bun run test:run       # 单次
bun run test:coverage  # 覆盖率
bun run test:e2e       # Playwright（需先启动 dev server；可用 BASE_URL 覆盖地址）
bun run test:e2e:ui    # Playwright UI 模式
bun run lint           # ESLint
```

E2E 用例位于 `e2e/`，覆盖首页、文章、主题切换、后台登录与 CRUD 等流程。

## 构建

```bash
bun run build
bun run start
```

`next.config.ts` 启用了 `output: "standalone"`，构建产物在 `.next/standalone/`，
Docker 镜像只复制该目录及相关静态资源即可，体积更小。
