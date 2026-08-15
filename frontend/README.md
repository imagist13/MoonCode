# Frontend · Moon Blog

Next.js 16 + React 19 + Tailwind v4 构建的博客前端。

## 本地开发

```bash
bun install
bun run dev          # → http://localhost:3000
```

可选 `.env.local`：

```bash
BACKEND_URL=http://localhost:8080   # Next rewrites 目标地址
NEXT_PUBLIC_API_BASE=/api/v1        # 浏览器侧调用的相对路径
```

## 目录约定

```
src/
├── app/
│   ├── (blog)/        # 公开博客路由组
│   │   ├── page.tsx           # 首页：Hero + 文章列表
│   │   ├── articles/[id]/    # 文章详情
│   │   ├── archives/         # 归档
│   │   ├── links/            # 友链
│   │   └── about/            # 关于
│   ├── (admin)/admin/        # 后台路由组
│   └── api/                  # Next API（转发/SSR 数据）
│
├── components/
│   ├── ui/           # shadcn/ui 基元
│   └── blog/         # 博客专用复合组件（Hero / ArticleCard / TopNav ...）
│
├── lib/              # 工具函数 + API 客户端
├── hooks/            # 自定义 hooks
└── types/            # 类型声明
```

## 路由说明

- `(blog)` 路由组：用户可见的所有公开页面，共享 `BlogLayout`
- `(admin)/admin`：管理后台，单独 `AdminLayout`，需登录
- API 路由只用来做 SSR 数据获取或重定向，业务接口走 `/api/v1/*` → 反代到后端

## 与后端的约定

- 所有后端调用走 `/api/v1/*`，由 `next.config.ts` 的 `rewrites` 反代到 `BACKEND_URL`
- 上传文件走 `/uploads/*`，同样反代到后端
- 这样浏览器侧永远同源，不会有 CORS 问题，也不会把宿主机地址打进 bundle

## 测试

```bash
bun run test           # vitest watch
bun run test:run       # 单次
bun run test:coverage  # 覆盖率
bun run test:e2e       # Playwright E2E
```

## 构建产物

```bash
bun run build
bun run start
```

`next.config.ts` 启用了 `output: "standalone"`，构建产物在 `.next/standalone/`，Docker 镜像只复制该目录即可，体积更小。