# Moon · Frontend

Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS v4 构建的博客前端骨架。

极简排版 + Playfair Display italic 强调词 + JetBrains Mono nav-pill 的视觉语言，
组件层重度借鉴 [shadcn/ui](https://ui.shadcn.com) 的 API 与样式，但**不引入 Radix UI**——
所有交互组件均基于原生 HTML + React Context 手写实现。

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env.local

# 3. 启动开发服务器
npm run dev
```

打开 http://localhost:3000。

后端 API 默认地址 `http://localhost:8080/api/v1`，可通过 `.env.local` 中的
`NEXT_PUBLIC_API_BASE` 覆盖。

---

## 目录结构

```
frontend/
├── app/                            # Next.js App Router
│   ├── (blog)/                     # 博客域（含 Header/Footer）
│   ├── (auth)/                     # 认证页（登录/注册）
│   ├── admin/                      # 后台
│   ├── api/auth/logout/route.ts    # 登出 Route Handler
│   ├── layout.tsx / page.tsx       # 根布局 & 首页
│   ├── globals.css                 # Tailwind v4 + Design Tokens
│   ├── error.tsx / not-found.tsx / loading.tsx
├── components/
│   ├── ui/                         # shadcn 风格原子组件
│   ├── layout/                     # SiteHeader / SiteFooter / AdminSidebar / NavLinks
│   ├── blog/                       # ArticleCard / ArticleMeta / TagList / Pagination …
│   ├── markdown/                   # MarkdownRenderer / CodeBlock
│   ├── admin/                      # StatCard / EditorShell
│   ├── common/                     # ThemeProvider / BackToTop
│   └── providers.tsx               # SWRConfig + ThemeProvider + Toaster
├── lib/
│   ├── api/                        # client.ts + users/articles/categories/tags
│   ├── auth/session.ts             # 服务端读取 cookie + 校验
│   ├── utils.ts                    # cn = twMerge(clsx(...))
│   └── constants.ts
├── stores/                         # zustand（UI / editor 草稿）
├── hooks/                          # use-theme / use-media-query / use-reading-progress / use-toast
├── types/                          # api / user / article / category / tag
├── config/                         # site / nav
├── middleware.ts                   # 保护 /admin
└── .env.example
```

---

## shadcn 风格组件清单（`components/ui/`）

| 组件 | 说明 |
|---|---|
| `button.tsx` | CVA variants: default / destructive / outline / secondary / ghost / link；sizes: default / sm / lg / icon；支持简化 `asChild`（clone 子元素） |
| `input.tsx` / `textarea.tsx` / `label.tsx` | shadcn 标准封装 |
| `card.tsx` | Card / CardHeader / CardTitle / CardDescription / CardContent / CardFooter |
| `badge.tsx` | CVA variants: default / secondary / destructive / outline |
| `separator.tsx` / `skeleton.tsx` / `avatar.tsx` / `kbd.tsx` | 视觉零件 |
| `tabs.tsx` | 极简自实现（React Context + `role="tab"`），API 与 shadcn 一致 |
| `dropdown-menu.tsx` | useState + 点击外部关闭 |
| `dialog.tsx` | 原生 fixed backdrop + Esc 关闭 |
| `toast.tsx` + `use-toast.ts` | 全局广播 store，`<Toaster />` 挂载于 Providers |
| `theme-toggle.tsx` | Sun / Moon 图标切换（lucide-react） |

---

## 路径别名

`tsconfig.json` 中：

```json
{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }
```

所以任何位置都可用 `@/components/ui/button`、`@/lib/api/articles` 等导入。

---

## 数据层与鉴权

- `lib/api/client.ts`：`apiFetch<T>` 通用封装，处理后端 `{ code, message, data }` 响应；`code !== 0` 抛出 `ApiError`
- Server Component 直接 `await` 数据，支持 `next: { revalidate }` 透传实现 ISR
- 客户端场景使用 `swr`
- 登录后将 JWT 写入 `moon_token` cookie（Path=/, SameSite=Lax）
- `middleware.ts` 在请求 `/admin/*` 时校验 cookie，缺失则重定向到 `/login`
- `getSession()` 用于服务端读取 cookie 并调用 `/users/profile` 校验

---

## 主题

- Tailwind v4 `@theme` 注入色板 + 字体 + 圆角设计 token
- 浅色模式 :root，深色模式 `.dark`
- next/font 加载 Inter / Playfair Display / JetBrains Mono，暴露为 `--font-inter` 等变量
- `ThemeProvider` + inline script 在注水前同步 `<html>.dark` 类，避免闪烁

---

## 依赖清单（本次新增）

```
class-variance-authority  clsx  tailwind-merge  tailwindcss-animate
lucide-react
swr  zustand
react-hook-form  @hookform/resolvers  zod
react-markdown  remark-gfm  rehype-slug  rehype-highlight
date-fns
```

已有：`next@16`, `react@19`, `tailwindcss@4`, `typescript@5`, `eslint@9`。

---

## 常用脚本

```bash
npm run dev     # 开发模式
npm run build   # 生产构建
npm run start   # 生产模式
npm run lint    # ESLint 校验
```

---

## 参考

架构设计详见 [`ARCHITECTURE.md`](./ARCHITECTURE.md)；预览效果参考 `../spec/frontend/preview/`。
