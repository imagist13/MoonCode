# Moon Blog · 前端架构设计

> Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4
> 面向 Go 后端 REST API（`/api/v1`）· 支持 SSR / ISR / CSR 混合

---

## 目录

1. [目标与原则](#1-目标与原则)
2. [技术栈](#2-技术栈)
3. [目录结构](#3-目录结构)
4. [路由规划（App Router）](#4-路由规划app-router)
5. [数据层](#5-数据层)
6. [状态管理](#6-状态管理)
7. [渲染策略](#7-渲染策略)
8. [认证与鉴权](#8-认证与鉴权)
9. [UI 与主题系统](#9-ui-与主题系统)
10. [粒子 / 三维动效系统](#10-粒子--三维动效系统)
11. [表单与校验](#11-表单与校验)
12. [错误边界与加载态](#12-错误边界与加载态)
13. [SEO 与元信息](#13-seo-与元信息)
14. [性能预算](#14-性能预算)
15. [代码规范](#15-代码规范)
16. [环境变量](#16-环境变量)
17. [依赖清单](#17-依赖清单)
18. [实施路线](#18-实施路线)

---

## 1. 目标与原则

- **阅读为先**：首屏文字优先渲染，动效不阻塞内容
- **默认 SSR / ISR**：SEO 与首屏一致重要
- **薄客户端**：数据获取尽量在 Server Component 完成
- **可测**：核心逻辑抽离到 hooks/lib，UI 组件纯展示
- **原生优先**：能用平台能力就不加库（`fetch`、`useFormState`、CSS `light-dark()`）
- **主题一致**：色板/圆角/字号集中在设计 token，禁止硬编码

---

## 2. 技术栈

| 领域 | 选型 | 备注 |
|---|---|---|
| 框架 | Next.js 16.2.9（App Router） | 已装 |
| UI 库 | React 19.2 | 已装 |
| 语言 | TypeScript 5 | 已装 |
| 样式 | Tailwind CSS v4 + `@tailwindcss/postcss` | 已装 |
| 数据获取 | 原生 `fetch` + Server Components + SWR（客户端） | 待装 SWR |
| 状态管理 | React Context + Zustand（复杂客户端态） | 待装 Zustand |
| 表单 | React Hook Form + Zod | 待装 |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-highlight` | 待装 |
| 图标 | `lucide-react` | 待装 |
| 三维 / 粒子 | `three` + 自研 canvas engine | 待装 |
| 请求鉴权 | JWT（Cookie 存储，SSR 可读） | — |
| 测试 | Vitest + React Testing Library（可选） | 后续 |
| Lint / Format | ESLint 9 (`eslint-config-next`) + Prettier + `prettier-plugin-tailwindcss` | 已装 ESLint |

---

## 3. 目录结构

```
frontend/
├── app/                              # App Router
│   ├── layout.tsx                    # 根布局：字体、主题、Providers
│   ├── page.tsx                      # 首页
│   ├── globals.css                   # 全局样式 + Tailwind + tokens
│   ├── error.tsx                     # 根错误边界
│   ├── not-found.tsx                 # 404
│   ├── loading.tsx                   # 根 loading
│   │
│   ├── (blog)/                       # 博客路由组：共享博客 header/footer
│   │   ├── layout.tsx
│   │   ├── articles/
│   │   │   ├── page.tsx              # 文章列表
│   │   │   └── [slug]/page.tsx       # 文章详情
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── tags/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── archive/page.tsx
│   │   ├── search/page.tsx
│   │   └── about/page.tsx
│   │
│   ├── (auth)/                       # 无 header/footer，聚焦登录
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── admin/                        # 后台
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # 仪表盘
│   │   ├── articles/
│   │   │   ├── page.tsx              # 文章管理
│   │   │   ├── new/page.tsx          # 新建文章
│   │   │   └── [id]/edit/page.tsx    # 编辑
│   │   └── account/page.tsx
│   │
│   └── api/                          # 可选：BFF 转发（如需）
│       └── revalidate/route.ts       # ISR 手动失效钩子
│
├── components/                       # 可复用组件（可拆更细）
│   ├── ui/                           # 原子：Button/Chip/Input/Kbd/Skeleton...
│   ├── layout/                       # Header/Footer/Nav/Sidebar
│   ├── blog/                         # ArticleCard/TOC/CategoryPill/TagCloud/ReadingProgress
│   ├── markdown/                     # MarkdownRenderer/CodeBlock/Toc
│   ├── admin/                        # EditorLayout/PublishSidebar/StatCard
│   ├── particles/                    # ParticleCanvas/vanta 封装
│   └── common/                       # ThemeToggle/BackToTop/ErrorFallback
│
├── lib/                              # 与框架无关的工具与领域逻辑
│   ├── api/                          # API 客户端
│   │   ├── client.ts                 # fetch 封装 + 拦截器
│   │   ├── users.ts
│   │   ├── articles.ts
│   │   ├── categories.ts
│   │   └── tags.ts
│   ├── auth/
│   │   ├── session.ts                # Cookie / JWT 读写
│   │   └── guards.ts
│   ├── markdown/
│   │   └── parse.ts                  # slug 生成、TOC 提取
│   ├── utils/
│   │   ├── cn.ts                     # clsx + tailwind-merge
│   │   ├── date.ts
│   │   └── seo.ts
│   └── constants.ts
│
├── stores/                           # Zustand
│   ├── ui.ts                         # 主题、抽屉、模态
│   └── admin-editor.ts               # 后台编辑器草稿状态
│
├── hooks/
│   ├── use-theme.ts
│   ├── use-reading-progress.ts
│   ├── use-media-query.ts
│   └── use-toc.ts
│
├── types/                            # 与后端 DTO 对齐的 TS 类型
│   ├── api.ts                        # ApiResponse<T> 通用包装
│   ├── user.ts
│   ├── article.ts
│   ├── category.ts
│   └── tag.ts
│
├── config/
│   ├── site.ts                       # 站点元信息
│   └── nav.ts                        # 导航项
│
├── styles/                           # 若有非 Tailwind 补充
│   └── tokens.css                    # CSS variables
│
├── public/
├── middleware.ts                     # 鉴权 middleware（保护 /admin）
├── next.config.ts
├── tailwind.config.ts                # v4 主要用 CSS，此处放主题扩展
├── postcss.config.mjs
├── tsconfig.json
└── eslint.config.mjs
```

---

## 4. 路由规划（App Router）

使用**路由组**隔离布局，且不影响 URL：

| URL | 组件路径 | 布局 | 渲染 |
|---|---|---|---|
| `/` | `app/page.tsx` | Root + BlogHeader | SSG / ISR |
| `/articles` | `(blog)/articles/page.tsx` | Blog | ISR（60s） |
| `/articles/[slug]` | `(blog)/articles/[slug]/page.tsx` | Blog | ISR + `generateStaticParams` |
| `/categories` | `(blog)/categories/page.tsx` | Blog | ISR |
| `/categories/[slug]` | `(blog)/categories/[slug]/page.tsx` | Blog | ISR |
| `/tags` | `(blog)/tags/page.tsx` | Blog | ISR |
| `/tags/[slug]` | `(blog)/tags/[slug]/page.tsx` | Blog | ISR |
| `/archive` | `(blog)/archive/page.tsx` | Blog | ISR |
| `/search` | `(blog)/search/page.tsx` | Blog | CSR（含参） |
| `/about` | `(blog)/about/page.tsx` | Blog | SSG |
| `/login` | `(auth)/login/page.tsx` | Auth | CSR |
| `/register` | `(auth)/register/page.tsx` | Auth | CSR |
| `/admin/*` | `admin/**` | Admin | CSR + Middleware 鉴权 |

### 段级配置

```ts
// (blog)/articles/[slug]/page.tsx
export const revalidate = 60;         // ISR
export const dynamicParams = true;    // 允许未预生成的 slug 动态构建

export async function generateStaticParams() {
  const list = await api.articles.slugs();
  return list.map(slug => ({ slug }));
}
```

---

## 5. 数据层

### 5.1 API 客户端（`lib/api/client.ts`）

```ts
// 极简 fetch 封装
export interface ApiResponse<T> { code: number; message: string; data: T }

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080/api/v1';

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: init.cache ?? 'no-store',
  });
  const body = (await res.json()) as ApiResponse<T>;
  if (!res.ok || body.code !== 0) {
    throw new ApiError(body.message ?? 'request failed', res.status, body.code);
  }
  return body.data;
}
```

### 5.2 每个资源一个文件

```ts
// lib/api/articles.ts
export const articles = {
  list: (p: { page?: number; pageSize?: number; category_id?: number; status?: number } = {}) =>
    apiFetch<{ list: Article[]; total: number }>(`/articles?${qs(p)}`),
  bySlug: (slug: string) => apiFetch<Article>(`/articles/slug/${slug}`),
  create: (data: CreateArticle, token: string) =>
    apiFetch<Article>('/articles', { method: 'POST', body: JSON.stringify(data), token }),
  // ...
};
```

### 5.3 Server Component 直接 await

```tsx
// (blog)/articles/[slug]/page.tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await articles.bySlug(slug);   // SSR/ISR 数据
  return <ArticleView data={article} />;
}
```

### 5.4 客户端场景用 SWR

- 搜索、admin 表格、无限滚动、点赞等交互场景使用 `useSWR`
- Key 与 API 路径一致，方便 mutate

---

## 6. 状态管理

**三层策略，各司其职**：

| 类型 | 方案 | 例子 |
|---|---|---|
| 服务器数据 | Server Component + SWR | 文章、分类、标签 |
| 应用 UI 态 | Zustand（`stores/ui.ts`） | 主题、抽屉、编辑器草稿 |
| 表单本地态 | React Hook Form | 登录、注册、写文章 |
| 上下文注入 | React Context | 当前用户、i18n |

> 不引入 Redux；SWR 承担服务器状态缓存。

---

## 7. 渲染策略

| 页面 | 首选 | 备用 |
|---|---|---|
| 首页 | ISR (`revalidate=300`) | — |
| 文章列表 | ISR (`revalidate=60`) | — |
| 文章详情 | ISR + `generateStaticParams` | 手动 revalidate on 发布 |
| 分类/标签页 | ISR (`revalidate=120`) | — |
| 搜索 | CSR（`searchParams` 触发） | — |
| 登录/注册 | CSR + Server Action（可选） | — |
| Admin | CSR（客户端组件） | — |

**Revalidate on 发布**：后台创建 / 更新文章后调用 `/api/revalidate?path=/articles/[slug]` 触发 `revalidatePath`。

---

## 8. 认证与鉴权

### 8.1 存储

- 登录成功后把 `token` 写入 **HttpOnly Cookie**（后端也写 / 或前端在 Route Handler 中包装写入）
- key：`moon_token`；同时把 `user` 简要信息写入普通 Cookie 便于 SSR 显示

### 8.2 Middleware（保护 admin）

```ts
// middleware.ts
export const config = { matcher: ['/admin/:path*'] };

export function middleware(req: NextRequest) {
  const token = req.cookies.get('moon_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  return NextResponse.next();
}
```

### 8.3 服务端读取用户

```ts
// lib/auth/session.ts
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('moon_token')?.value;
  if (!token) return null;
  try {
    return await users.profile(token); // 通过 API 校验
  } catch { return null; }
}
```

### 8.4 登出

Route Handler 调用后端 `POST /users/logout` 并清 Cookie。

---

## 9. UI 与主题系统

### 9.1 Design Tokens（CSS variables）

在 `app/globals.css`：

```css
@theme {
  --font-sans: "Inter", ui-sans-serif;
  --font-serif: "Playfair Display", ui-serif;
  --font-mono: "JetBrains Mono", ui-monospace;

  --color-bg: #fafaf9;
  --color-bg-elev: #ffffff;
  --color-fg: #18181b;
  --color-muted: #71717a;
  --color-accent: #7c3aed;
  --color-accent-2: #ec4899;

  --radius-sm: 8px;
  --radius: 14px;
  --radius-lg: 24px;
}

:root.dark {
  --color-bg: #09090b;
  --color-bg-elev: #18181b;
  --color-fg: #fafafa;
  --color-muted: #a1a1aa;
}
```

### 9.2 组件命名与分层

- `ui/`：原子（Button、Chip、Kbd、Input、Skeleton、Tabs）
- `layout/`：Header、Footer、AdminSidebar
- `blog/`：ArticleCard、ArticleMeta、TagList、TOC、ReadingProgress、Pagination
- `markdown/`：MarkdownRenderer、CodeBlock（含 copy）、AnchoredHeading
- `admin/`：DashboardStat、EditorLayout、PublishSidebar
- `particles/`：`ParticleCanvas`, `VantaGlobe`, `AuraOrb`
- `common/`：ThemeToggle、BackToTop、ErrorFallback

### 9.3 主题切换

- `useTheme` hook：读取 `localStorage.theme` 或 `prefers-color-scheme`
- 通过给 `<html>` 加 `.dark` 类切换
- SSR 阶段用 Cookie 初始化避免闪烁（写一个 `beforeInteractive` 脚本读 cookie 设 class）

---

## 10. 粒子 / 三维动效系统

### 10.1 分层封装

- `components/particles/ParticleCanvas.tsx` — 通用 canvas 挂载器（尊重 `prefers-reduced-motion`）
- `components/particles/AuraOrb.tsx` — Hero 能量球（星环+脉冲+火花+鼠标交互）
- `components/particles/VantaBackground.tsx` — Vanta GLOBE / WAVES / NET 三种预设
- `components/particles/ImageParticles.tsx` — 图片粒子复刻（对应 `image-to-particles` skill）

### 10.2 性能守则

- 全部动效在**视口内**才启动 IntersectionObserver
- 支持 `prefers-reduced-motion` 关闭
- 单页最多一处重型 canvas
- DPR 上限 `Math.min(devicePixelRatio, 2)`

---

## 11. 表单与校验

### 11.1 客户端

```ts
// login
const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
type FormData = z.infer<typeof schema>;
const { register, handleSubmit, formState } = useForm<FormData>({ resolver: zodResolver(schema) });
```

### 11.2 Server Action（可选）

- 用于登录 / 注册 / 发文章：直接把 token 写 Cookie，避免暴露到 client
- 未做 Server Action 时用 Route Handler `app/api/auth/login/route.ts`

---

## 12. 错误边界与加载态

| 文件 | 作用 |
|---|---|
| `app/error.tsx` | 根错误边界 |
| `app/(blog)/error.tsx` | 博客域错误边界 |
| `app/admin/error.tsx` | 后台错误边界 |
| `app/loading.tsx` / 段级 `loading.tsx` | 骨架屏 |
| `app/not-found.tsx` | 全站 404 |

`ApiError` 会包含 `status`/`code`/`message`，边界组件按 code 展示不同提示。

---

## 13. SEO 与元信息

- `app/layout.tsx` 使用 `export const metadata` 声明默认 title / description / icons / openGraph
- 每个动态页导出 `generateMetadata()`：读取 article/category 数据填充 title、描述、`openGraph.images`（封面）、`twitter.card`
- `app/sitemap.ts`、`app/robots.ts` 由后端接口拉取全量 slug 生成
- `<link rel="canonical">` 使用绝对 URL

---

## 14. 性能预算

| 指标 | 目标 |
|---|---|
| LCP | < 2.0s（4G） |
| CLS | < 0.05 |
| INP | < 200ms |
| JS shipped（首页） | < 120 kB gz |

手段：
- 尽量 Server Component
- 图片一律 `next/image`（含 `blur-placeholder`）
- 字体用 `next/font` 局部加载
- 粒子/canvas 全部 `dynamic(() => import(...), { ssr: false })` + `<Suspense>`
- `React.lazy` 拆分 Admin 编辑器

---

## 15. 代码规范

### 15.1 命名

- 组件：PascalCase（`ArticleCard.tsx`）
- Hook：`use-*.ts`
- 工具：kebab-case（`format-date.ts`）
- Store：`use-*-store.ts`

### 15.2 Import 顺序

1. 外部包
2. 别名（`@/lib`、`@/components`、`@/types`）
3. 相对路径

在 `tsconfig.json` 添加：

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

### 15.3 Client / Server 组件

- 默认 Server；需要用 hooks/事件时才 `"use client"`
- 只把最小交互块声明为 client，其他包裹为 wrapper

### 15.4 类型对齐

- `types/*.ts` 与后端 DTO 一一对应
- 后端字段用 snake_case，前端类型直接沿用，避免手工映射；仅在 UI 层使用时用 destructure rename

---

## 16. 环境变量

```
# .env.local
NEXT_PUBLIC_API_BASE=http://localhost:8080/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=your-secret-here      # /api/revalidate 用
```

规则：
- 只有 `NEXT_PUBLIC_*` 才在客户端暴露
- 服务端专用变量不加前缀

---

## 17. 依赖清单

### 需新增

```bash
npm i swr zustand react-hook-form @hookform/resolvers zod \
      clsx tailwind-merge lucide-react \
      react-markdown remark-gfm rehype-highlight rehype-slug \
      date-fns

npm i -D prettier prettier-plugin-tailwindcss @types/react-syntax-highlighter
```

### 三维/粒子（按需）

```bash
npm i three
# vanta 无 npm 官方源码时用 CDN 或本地脚本
```

---

## 18. 实施路线

### 阶段 1 · 骨架搭建
- [ ] 建立 `components/`、`lib/`、`types/`、`hooks/`、`stores/`、`config/` 目录骨架
- [ ] `lib/api/client.ts` + 4 个资源客户端
- [ ] `types/*` 与后端 DTO 对齐
- [ ] 设计 token 写入 `globals.css`
- [ ] `middleware.ts` 保护 `/admin`

### 阶段 2 · 博客域
- [ ] Layout（Header/Footer/BlogLayout）
- [ ] 首页（对接 latest articles）
- [ ] 文章列表 / 详情（ISR + generateStaticParams）
- [ ] 分类 / 标签页
- [ ] Markdown 渲染 + TOC + 代码块 copy
- [ ] 阅读进度、返回顶部

### 阶段 3 · 认证
- [ ] 登录 / 注册页
- [ ] Cookie 写入 + `getSession`
- [ ] Header 显示当前用户 / 登出

### 阶段 4 · 后台
- [ ] Dashboard 三卡 + 文章列表 tab
- [ ] 写文章：标题 / 摘要 / Markdown 编辑器 + 分类 / 标签
- [ ] 账号：资料 + 修改密码

### 阶段 5 · 动效与精修
- [ ] 首页 Hero AuraOrb（粒子球 + 鼠标交互）
- [ ] About 页 Vanta NET
- [ ] Admin 编辑器自动保存草稿到 Zustand
- [ ] Web Vitals 观察 + 拆包优化

### 阶段 6 · 上线
- [ ] `next build` 无 warning
- [ ] Lighthouse ≥ 95
- [ ] 环境变量拆分 dev/prod
- [ ] 部署（Vercel / 自托管 Node）

---

> 本文件描述**目标架构**；当前 `frontend/` 内仅有 Next.js 初始化模板，实际按 [§18](#18-实施路线) 分阶段落地。
