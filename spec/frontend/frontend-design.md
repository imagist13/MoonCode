# MoonBlog 前端布局与页面设计文档

## 1. 项目概述

MoonBlog 前端基于 Next.js 16（App Router）+ React 19 + TypeScript + Tailwind CSS v4 构建，采用 SSR/SSG 混合渲染策略，为个人博客提供优雅、响应式、可访问性良好的阅读与创作体验。

### 1.1 技术栈

| 分类 | 技术 | 版本 |
|:----|:-----|:-----|
| 框架 | Next.js (App Router) | 16.2.9 |
| UI 库 | React | 19.2.4 |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 4.x |
| 状态管理 | Zustand（轻量）/ React Context | - |
| 数据请求 | fetch + SWR / TanStack Query | - |
| 表单 | React Hook Form + Zod | - |
| Markdown | react-markdown + remark/rehype 插件 | - |
| 代码高亮 | shiki | - |
| 图标 | lucide-react | - |
| 动画 | framer-motion（按需） | - |

### 1.2 设计目标

- **内容优先**：以阅读体验为核心，排版清晰、字体舒适、留白充足。
- **响应式**：移动端 / 平板 / 桌面 全适配（Mobile-First）。
- **主题切换**：支持 Light / Dark 双主题，可跟随系统。
- **性能优先**：SSG 静态生成文章页，SSR 处理动态列表，图片懒加载。
- **SEO 友好**：完整的 metadata、OpenGraph、结构化数据。
- **可访问性**：符合 WCAG AA 标准，语义化 HTML、键盘可导航。

---

## 2. 设计规范

### 2.1 色彩系统

采用中性灰调 + 强调色的极简配色，支持 Light / Dark 主题。

**Light 主题**

| 用途 | 变量 | 值 |
|:----|:----|:----|
| 背景 | `--bg` | `#ffffff` |
| 次级背景 | `--bg-secondary` | `#f9fafb` |
| 主文字 | `--text` | `#111827` |
| 次级文字 | `--text-secondary` | `#6b7280` |
| 边框 | `--border` | `#e5e7eb` |
| 主色 | `--primary` | `#3b82f6` |
| 强调 | `--accent` | `#8b5cf6` |

**Dark 主题**

| 用途 | 变量 | 值 |
|:----|:----|:----|
| 背景 | `--bg` | `#0a0a0a` |
| 次级背景 | `--bg-secondary` | `#171717` |
| 主文字 | `--text` | `#f5f5f5` |
| 次级文字 | `--text-secondary` | `#a1a1aa` |
| 边框 | `--border` | `#262626` |
| 主色 | `--primary` | `#60a5fa` |
| 强调 | `--accent` | `#a78bfa` |

### 2.2 字体系统

- **正文字体**：Geist Sans / Inter（系统 fallback：`-apple-system, BlinkMacSystemFont, sans-serif`）
- **等宽字体**：Geist Mono / JetBrains Mono（代码块使用）
- **中文字体**：`"PingFang SC", "Microsoft YaHei", sans-serif`

**字号阶梯（Tailwind 类）**

| 场景 | 类 | 大小 |
|:----|:----|:----|
| H1 | `text-4xl md:text-5xl` | 36-48px |
| H2 | `text-3xl md:text-4xl` | 30-36px |
| H3 | `text-2xl` | 24px |
| H4 | `text-xl` | 20px |
| 正文 | `text-base` | 16px |
| 次要 | `text-sm` | 14px |
| 说明 | `text-xs` | 12px |

### 2.3 间距与栅格

- **容器最大宽度**：`max-w-4xl`（内容页 768px）/ `max-w-6xl`（列表页 1152px）
- **水平内边距**：`px-4 md:px-6 lg:px-8`
- **段落间距**：`space-y-6`
- **断点**：`sm: 640px | md: 768px | lg: 1024px | xl: 1280px`

### 2.4 圆角与阴影

- **圆角**：`rounded-md`（按钮/输入）、`rounded-lg`（卡片）、`rounded-full`（头像/标签）
- **阴影**：`shadow-sm`（普通卡片）、`shadow-md`（悬浮态）、`shadow-lg`（弹窗）

---

## 3. 整体布局结构

### 3.1 布局分层

```
┌────────────────────────────────────────┐
│              Header 顶部导航             │  ← sticky top-0
├────────────────────────────────────────┤
│                                        │
│              Main 主内容区              │  ← flex-1
│                                        │
├────────────────────────────────────────┤
│              Footer 底部信息            │
└────────────────────────────────────────┘
```

### 3.2 Header（全局顶栏）

- **左侧**：Logo + 站点名（点击回首页）
- **中间**：导航菜单（首页 / 文章 / 分类 / 标签 / 归档 / 关于）
- **右侧**：搜索图标、主题切换按钮、登录/用户头像下拉
- **样式**：`sticky top-0 z-50 backdrop-blur bg-white/80 dark:bg-black/80 border-b`
- **移动端**：折叠为汉堡菜单，抽屉式展开

### 3.3 Footer（全局底栏）

- **上部**：站点简介 + 快捷链接（分类、标签、RSS）+ 社交图标（GitHub、Twitter、Email）
- **下部**：版权信息 + 备案号 + Powered by

### 3.4 Layout 变体

| 布局名 | 适用页面 | 结构 |
|:------|:--------|:----|
| `RootLayout` | 全站根布局 | Header + `<main>` + Footer |
| `BlogLayout` | 文章列表/详情 | 单列居中，最大宽度 `max-w-4xl` |
| `AdminLayout` | 后台管理 | 左侧 Sidebar + 顶部 Topbar + 内容区 |
| `AuthLayout` | 登录/注册 | 全屏居中卡片 |

---

## 4. 页面清单与路由规划

基于 Next.js App Router 的目录约定：

```
app/
├── layout.tsx                       # 根布局
├── page.tsx                         # 首页 /
├── loading.tsx                      # 全局加载
├── not-found.tsx                    # 404
├── error.tsx                        # 错误边界
├── globals.css
│
├── (blog)/                          # 博客路由组
│   ├── articles/
│   │   ├── page.tsx                 # /articles 文章列表
│   │   └── [slug]/
│   │       └── page.tsx             # /articles/[slug] 文章详情
│   ├── categories/
│   │   ├── page.tsx                 # /categories 分类列表
│   │   └── [slug]/
│   │       └── page.tsx             # /categories/[slug] 分类详情
│   ├── tags/
│   │   ├── page.tsx                 # /tags 标签云
│   │   └── [slug]/
│   │       └── page.tsx             # /tags/[slug] 标签文章
│   ├── archive/
│   │   └── page.tsx                 # /archive 归档
│   ├── about/
│   │   └── page.tsx                 # /about 关于
│   └── search/
│       └── page.tsx                 # /search 搜索结果
│
├── (auth)/                          # 认证路由组
│   ├── login/page.tsx               # /login
│   └── register/page.tsx            # /register
│
└── admin/                           # 后台管理
    ├── layout.tsx                   # 后台布局
    ├── page.tsx                     # /admin 仪表盘
    ├── articles/
    │   ├── page.tsx                 # /admin/articles 文章管理
    │   ├── new/page.tsx             # /admin/articles/new 新建
    │   └── [id]/edit/page.tsx       # 编辑
    ├── categories/page.tsx
    ├── tags/page.tsx
    └── settings/page.tsx
```

---

## 5. 主要页面设计

### 5.1 首页 `/`

**目标**：展示站点概览，引导用户浏览最新文章。

**结构**：

```
┌─────────────────────────────────────┐
│         Hero 区（自我介绍/Slogan）    │
│         + 头像 + 社交链接             │
├─────────────────────────────────────┤
│         最新文章（3-6 篇卡片）         │
├─────────────────────────────────────┤
│         精选分类（横向 4 列）          │
├─────────────────────────────────────┤
│         热门标签（标签云）             │
├─────────────────────────────────────┤
│         「查看全部文章」CTA           │
└─────────────────────────────────────┘
```

**要点**：
- Hero 区支持配置化文案（避免硬编码）。
- 文章卡片显示：封面、标题、摘要、发布日期、阅读时长、分类。
- 使用 `next/image` 优化封面图片。

### 5.2 文章列表页 `/articles`

**结构**：

```
┌─────────────────────────────────────┐
│    页面标题 + 筛选（分类/标签下拉）    │
├──────────────────────┬──────────────┤
│                      │  Sidebar     │
│  文章卡片列表         │  - 搜索       │
│  （每卡片：封面        │  - 热门标签    │
│   +标题+摘要+meta）   │  - 归档链接    │
│                      │              │
├──────────────────────┴──────────────┤
│         分页 / 无限滚动               │
└─────────────────────────────────────┘
```

**要点**：
- 桌面端两列，移动端单列（Sidebar 移至底部或抽屉）。
- 支持 URL 参数：`?category=xx&tag=yy&page=1`。
- 使用 SWR/TanStack Query 缓存分页数据。

### 5.3 文章详情页 `/articles/[slug]`

**结构**：

```
┌─────────────────────────────────────┐
│              封面图（可选）            │
├─────────────────────────────────────┤
│  标题（H1）                          │
│  作者 · 日期 · 阅读时长 · 分类·标签    │
├─────────────────────────────────────┤
│  ┌──────────┬──────────────────┐  │
│  │  目录 TOC │   Markdown 正文    │  │
│  │  sticky   │   （文字/图片/代码）│  │
│  │          │                    │  │
│  └──────────┴──────────────────┘  │
├─────────────────────────────────────┤
│      文章底部：点赞 · 分享 · 上一/下一 │
├─────────────────────────────────────┤
│           相关文章推荐（3 篇）         │
├─────────────────────────────────────┤
│              评论区（可选，后期）       │
└─────────────────────────────────────┘
```

**要点**：
- 使用 SSG（`generateStaticParams`）预生成，通过 ISR 定时刷新。
- 目录 TOC 在桌面端 sticky 显示，滚动时高亮当前章节。
- 代码块使用 shiki 服务端高亮，支持复制按钮。
- 阅读进度条固定顶部。
- 完整的 SEO metadata（title、description、og:image、article:published_time）。

### 5.4 分类页 `/categories` 与 `/categories/[slug]`

- **列表页**：卡片网格展示所有分类（图标 + 名称 + 文章数）。
- **详情页**：分类描述 + 该分类下文章列表（复用文章卡片组件）。

### 5.5 标签页 `/tags` 与 `/tags/[slug]`

- **列表页**：标签云，字号根据文章数动态变化。
- **详情页**：该标签下的文章列表。

### 5.6 归档页 `/archive`

按年份/月份分组时间线展示所有文章标题与日期：

```
2026
├── 07 月
│    ├── 07-25  《文章标题》
│    └── 07-20  《文章标题》
└── 06 月
     └── ...
```

### 5.7 关于页 `/about`

Markdown 渲染的静态内容：个人介绍、技能栈、联系方式、简历下载等。

### 5.8 搜索页 `/search`

- 顶部大搜索框（自动聚焦）。
- 输入关键词后展示匹配的文章列表（标题/摘要高亮）。
- 支持防抖（300ms）。

### 5.9 登录 / 注册 `/login` `/register`

- 全屏居中卡片。
- 表单：用户名/邮箱 + 密码（注册多一个昵称）。
- React Hook Form + Zod 校验。
- 登录成功后写入 JWT（httpOnly cookie 或 localStorage）。

### 5.10 后台管理 `/admin/*`

**布局**：

```
┌────────┬───────────────────────────┐
│        │   Topbar（面包屑+用户菜单）  │
│Sidebar ├───────────────────────────┤
│        │                           │
│- 仪表盘 │        内容区              │
│- 文章   │                           │
│- 分类   │                           │
│- 标签   │                           │
│- 设置   │                           │
└────────┴───────────────────────────┘
```

**页面**：

| 页面 | 路径 | 功能 |
|:----|:----|:----|
| 仪表盘 | `/admin` | 数据概览：文章数、访问量、评论数 |
| 文章列表 | `/admin/articles` | 表格 + 增删改查 + 状态过滤 |
| 新建/编辑文章 | `/admin/articles/new`、`/admin/articles/[id]/edit` | Markdown 编辑器 + 元信息表单 |
| 分类管理 | `/admin/categories` | CRUD |
| 标签管理 | `/admin/tags` | CRUD |
| 站点设置 | `/admin/settings` | 站点标题、简介、社交链接等 |

**编辑器要点**：
- 双栏布局：左侧 Markdown 输入 / 右侧实时预览。
- 支持图片粘贴上传、自动保存草稿（localStorage）。
- 元信息面板：标题、slug、封面、分类、标签、状态、发布时间。

---

## 6. 组件设计

### 6.1 目录结构建议

```
components/
├── ui/                       # 基础 UI（无业务）
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Dropdown.tsx
│   ├── Dialog.tsx
│   ├── Toast.tsx
│   └── Skeleton.tsx
├── layout/                   # 布局组件
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   ├── MobileNav.tsx
│   └── ThemeToggle.tsx
├── blog/                     # 博客业务组件
│   ├── ArticleCard.tsx
│   ├── ArticleList.tsx
│   ├── ArticleMeta.tsx
│   ├── TagCloud.tsx
│   ├── CategoryGrid.tsx
│   ├── TOC.tsx
│   ├── ReadingProgress.tsx
│   ├── ShareButtons.tsx
│   └── RelatedArticles.tsx
├── markdown/                 # Markdown 渲染
│   ├── MarkdownRenderer.tsx
│   ├── CodeBlock.tsx
│   └── ImageZoom.tsx
├── admin/                    # 后台组件
│   ├── DataTable.tsx
│   ├── MarkdownEditor.tsx
│   └── StatCard.tsx
└── common/
    ├── SearchBar.tsx
    ├── Pagination.tsx
    ├── EmptyState.tsx
    └── ErrorBoundary.tsx
```

### 6.2 关键组件说明

- **ArticleCard**：接收 `article: Article` prop，展示封面、标题、摘要、元信息，Hover 时轻微上浮 + 阴影加深。
- **MarkdownRenderer**：封装 react-markdown，配置 remark-gfm、rehype-slug、rehype-autolink-headings、shiki。
- **TOC**：解析 Markdown 生成目录树，IntersectionObserver 监听高亮。
- **ThemeToggle**：使用 `next-themes` 或自实现，切换 `class="dark"` 到 `<html>`。
- **SearchBar**：受控输入 + 防抖，路由跳转到 `/search?q=xxx`。

---

## 7. 状态管理与数据层

### 7.1 状态划分

| 类型 | 方案 |
|:----|:----|
| 服务端数据（文章、分类等） | SWR / TanStack Query，自动缓存与重新验证 |
| 全局 UI 状态（主题、侧边栏开关） | Zustand |
| 用户认证 | Zustand + httpOnly Cookie |
| 表单状态 | React Hook Form |
| URL 状态（筛选、分页） | Next.js `useSearchParams` |

### 7.2 API 层封装

```
lib/
├── api/
│   ├── client.ts        # fetch 封装，自动附带 JWT、统一错误处理
│   ├── articles.ts      # 文章相关 API
│   ├── categories.ts
│   ├── tags.ts
│   └── auth.ts
├── hooks/
│   ├── useArticles.ts   # SWR hook
│   ├── useAuth.ts
│   └── useTheme.ts
├── utils/
│   ├── format-date.ts
│   ├── slugify.ts
│   └── reading-time.ts
└── types/
    ├── article.ts
    ├── category.ts
    ├── tag.ts
    └── user.ts
```

### 7.3 与后端接口对接

- 基础地址：`NEXT_PUBLIC_API_BASE_URL`（.env.local 配置）
- 统一响应：`{ code: number, message: string, data: T }`
- 认证：请求头 `Authorization: Bearer <token>`
- 错误处理：拦截 401 跳转登录、5xx 显示 Toast。

---

## 8. 响应式与可访问性

### 8.1 断点策略（Mobile-First）

| 断点 | 适用设备 | 主要变化 |
|:----|:--------|:--------|
| `< sm` | 手机 | 单列、汉堡菜单、TOC 隐藏 |
| `sm - md` | 大屏手机/小平板 | 单列、导航展开 |
| `md - lg` | 平板 | 内容+侧栏或双列卡片 |
| `>= lg` | 桌面 | 完整多列布局、TOC 显示 |

### 8.2 可访问性检查项

- 所有交互元素可通过 Tab 键访问，`:focus-visible` 明显。
- 图片必须有 `alt`；装饰性图片使用 `alt=""`。
- 语义化标签：`<article>`、`<nav>`、`<main>`、`<aside>`。
- 色对比度符合 WCAG AA（4.5:1 以上）。
- 表单控件与 `<label>` 关联。
- Dialog 使用焦点陷阱。

---

## 9. 性能优化

- **图片**：`next/image` 自动 WebP、懒加载、响应式 sizes。
- **字体**：`next/font/local` 或 `next/font/google` 自托管，避免 CLS。
- **代码分割**：动态 `import()` 加载 MarkdownEditor 等重量组件。
- **缓存**：SSG + ISR，静态资源 CDN 缓存。
- **预取**：`<Link prefetch>` 默认开启，首屏关键页预取。
- **Bundle 分析**：`@next/bundle-analyzer` 定期审查。

---

## 10. SEO 与元信息

- 每个页面通过 `generateMetadata` 生成动态 metadata。
- 站点根 `metadata.metadataBase` 统一配置。
- 文章页添加 JSON-LD 结构化数据（`Article` schema）。
- `sitemap.xml` / `robots.txt` 通过 `app/sitemap.ts` 与 `app/robots.ts` 生成。
- OpenGraph 图片：`app/opengraph-image.tsx` 动态生成或静态。

---

## 11. 开发里程碑

| 阶段 | 内容 | 产出 |
|:----|:----|:----|
| M1 | 设计规范落地 | 全局样式、主题系统、Layout、Header/Footer |
| M2 | 内容型页面 | 首页、文章列表、文章详情、分类/标签/归档/关于 |
| M3 | 交互与搜索 | 搜索页、主题切换、TOC、阅读进度、分享 |
| M4 | 认证与后台 | 登录/注册、后台布局、文章 CRUD、Markdown 编辑器 |
| M5 | 优化与上线 | SEO、性能、a11y、Lighthouse 90+、部署 |

---

## 12. 待确认事项

- [ ] 是否需要评论系统？（Giscus / 自建）
- [ ] 是否需要多语言支持（i18n）？
- [ ] 后台是否需要多用户 / 权限系统？
- [ ] 是否集成访问统计（Umami / Plausible）？
- [ ] 图片存储方案（本地 / OSS / Cloudinary）？

---

> 本文档为前端设计初稿，欢迎审阅并提出调整意见，确认后进入实施阶段。
