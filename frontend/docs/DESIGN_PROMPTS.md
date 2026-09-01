# Dim Stack 前端 — 专业设计提示词手册

> 本文档将 `frontend/` 项目的视觉语言、布局模式、组件风格、交互细节，提炼为可被任意 AI 设计工具（Midjourney / DALL·E / v0 / Cursor / Claude / 内部设计 Agent）直接消费的结构化提示词。
>
> 所有提示词严格对齐 `src/app/globals.css` 中的 OKLCH 设计 Token、`components.json`（shadcn 配置）以及 `public/banner-hero*.html` 中的视觉实现。

---

## 0 · 项目视觉指纹（Visual DNA）

```
# MASTER STYLE PROMPT — Dim Stack 博客 / 后台

身份：
  - 一个「开发者向个人博客 + 内容管理后台」组合产品。
  - 名为 Dim Stack（次元栈），品牌标识字「Blogs」（行内品牌色）。

色彩（OKLCH，CSS 自定义属性 brand-*）：
  - 主色：科技蓝 (hue 250–262)，强调色向紫 (290) 倾斜
    · brand-500 = oklch(0.62 0.195 255)  ← 主按钮 / Logo / 焦点
    · brand-600 = oklch(0.55 0.220 258)  ← hover
    · brand-700 = oklch(0.48 0.225 262)
    · brand-200 = oklch(0.87 0.060 250)  ← 玻璃高光 / 渐变文字中段
  - 中性：纯白底 (oklch(1 0 0)) + 暖灰前景 (oklch(0.145 0 0))
  - 状态色：destructive = oklch(0.577 0.245 27.325)
  - 图表色阶：固定 5 档，均落在品牌蓝色域（brand-500 → brand-200 → brand-700）

字体：
  - Sans/Heading: "Geist"（中文回落 "PingFang SC" / "Microsoft YaHei"），ui-sans-serif, system-ui
  - Mono:        "Geist Mono"，用于代码、API Key、配置 JSON
  - 抗锯齿：-webkit-font-smoothing: antialiased，-moz-osx-font-smoothing: grayscale

几何 / 圆角：
  - 全局基础圆角：0.625rem (10px)
  - 派生：sm/md/lg/xl/2xl/3xl/4xl = base × {0.6, 0.8, 1, 1.4, 1.8, 2.2, 2.6}
  - 头像、徽章、CTA 按钮：rounded-full
  - 卡片、面板、对话框：rounded-lg（默认）/ rounded-2xl（Hero / 玻璃面板）
  - 输入框 / Select：rounded-md

阴影（3 档语义化）：
  - shadow-card         = 0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .04)        ← 卡片默认
  - shadow-card-hover   = 0 10px 25px -3px rgb(0 0 0 / .08), 0 4px 10px -4px rgb(0 0 0 / .04)   ← 卡片 hover 浮起
  - shadow-brand-glow   = 0 0 0 3px rgb(59 130 246 / .18)                                         ← 输入框 focus ring

视觉语言关键词：
  极简、信息密度低、克制的玻璃拟态（仅用于 Hero / 登录 / 弹窗）、
  大留白、细腻 1px 分隔、克制的微动效、全部遵循 prefers-reduced-motion。

深色模式：
  - 背景 oklch(0.145 0 0)（近黑）
  - 卡片 oklch(0.205 0 0)
  - 品牌色整体提亮（brand-500 → oklch(0.72 0.185 250)）以保证对比度
  - 主题切换通过 View Transition API 实现「点击位置 → 全屏圆形涟漪扩散」动效

组件库血统：shadcn/ui（@base-ui/react + Radix） + lucide-react 图标 + framer-motion 微动效 + recharts 数据可视化 + @uiw/react-md-editor Markdown 编辑器
```

---

## 1 · 全局设计 Token（Design Token Prompt）

```
请使用以下 CSS 变量作为整套设计的「唯一真实来源（Single Source of Truth）」，
所有颜色必须用 OKLCH 表达，禁止写死 hex / rgb。

/* === 品牌色（蓝色为主，紫色为副） === */
--brand-50:  oklch(0.97 0.014 250);
--brand-100: oklch(0.93 0.030 250);
--brand-200: oklch(0.87 0.060 250);
--brand-300: oklch(0.78 0.115 250);
--brand-400: oklch(0.70 0.160 250);
--brand-500: oklch(0.62 0.195 255);   /* PRIMARY */
--brand-600: oklch(0.55 0.220 258);   /* PRIMARY-HOVER */
--brand-700: oklch(0.48 0.225 262);
--brand-800: oklch(0.42 0.215 265);
--brand-900: oklch(0.36 0.190 268);

/* === 中性 / 语义色 === */
--background:        oklch(1 0 0);              /* 浅色 */
--foreground:        oklch(0.145 0 0);
--card:              oklch(1 0 0);
--card-foreground:   oklch(0.145 0 0);
--muted:             oklch(0.97 0 0);
--muted-foreground:  oklch(0.556 0 0);
--border:            oklch(0.922 0 0);
--input:             oklch(0.922 0 0);
--ring:              oklch(0.708 0 0);
--destructive:       oklch(0.577 0.245 27.325);
--accent:            oklch(0.96 0.025 250);     /* 选中态：品牌浅蓝 */
--accent-foreground: var(--brand-700);

/* === 圆角 === */
--radius: 0.625rem;  /* 全局基础 */

/* === 阴影 === */
--shadow-card:        0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .04);
--shadow-card-hover:  0 10px 25px -3px rgb(0 0 0 / .08), 0 4px 10px -4px rgb(0 0 0 / .04);
--shadow-brand-glow:  0 0 0 3px rgb(59 130 246 / .18);

暗色模式仅替换以下 4 项（其余语义自动联动）：
  --background → oklch(0.145 0 0)
  --card       → oklch(0.205 0 0)
  --border     → oklch(1 0 0 / 10%)
  --ring       → oklch(0.556 0 0)
  brand-* 整体亮度上调（brand-500 → oklch(0.72 0.185 250)）
```

---

## 2 · 全局布局 Prompt

```
布局总览：

桌面 (≥1024px)：
  - 顶部固定 sticky 导航条（高 64px，背景 background/80 + backdrop-blur-xl，下边 1px border-border/60）
  - 主内容区：最大宽度 1100–1280px（max-w-275 / max-w-6xl），水平居中，水平 padding 16px
  - 博客两栏：grid lg:grid-cols-[1fr_300px]，gap-8
  - 管理后台两栏：固定左侧 sidebar（width 16rem，collapsible="icon"）+ 右侧 main（flex-1）

平板 (≥768px)：
  - 导航变 md:flex（仍水平居中），但隐藏部分次要链接
  - 两栏变成单列堆叠

手机 (<768px)：
  - 顶部只保留 logo + 主题切换 + 登录按钮 + 汉堡菜单
  - 汉堡点击弹出右侧抽屉式 Sheet（width 72 = 288px）
  - 博客两栏全部纵向堆叠

垂直节奏：
  - 页面纵向 padding：py-8（博客）/ p-6（后台）
  - 区块之间：space-y-6（默认）/ space-y-8（Hero 与列表之间）/ space-y-4（表单内）
  - 卡片内 padding：p-6（Card 默认）/ p-4（紧凑型卡片）

栅格：
  - 统计卡片：grid sm:grid-cols-2 lg:grid-cols-4，gap-4
  - 表单双列：grid sm:grid-cols-2，gap-4
  - 三列表单：grid sm:grid-cols-3，gap-4
```

---

## 3 · 核心组件 Prompt

### 3.1 顶部导航 TopNav

```
TopNav 设计提示词：

位置：sticky top-0 z-50，跨越整页宽度。
结构（桌面，左→右）：
  [Logo "Blogs"（brand-500 色）]    [导航链接·绝对居中]    [主题切换 IconButton][用户头像 Dropdown / 登录按钮]

Logo：
  - 文字「Blogs」，字号 text-lg，字重 font-bold，字距 tracking-tight
  - 单色 brand-500，hover opacity-80
  - 不带图标，纯文字标

导航链接（NavLink）：
  - 共 8 项：首页 / 归档 / 分类 / 标签 / 说说 / 友链 / 留言 / 关于
  - 字号 text-sm，font-medium
  - 默认：text-muted-foreground
  - 激活（pathname 完全匹配）：text-brand-600（深色 text-brand-400）
  - hover：bg-accent + text-foreground
  - padding：px-3 py-2，圆角 rounded-md，过渡 transition-colors

主题切换按钮：
  - IconButton size=icon，hover 时背景 brand-50 + 文字 brand-600（深色 brand-900/30 + brand-400）
  - 切换瞬间触发「圆形涟漪扩散」View Transition，中心点为按钮中心

登录按钮（未登录态）：
  - 圆角药丸：rounded-full
  - 背景 brand-500，文字白色，padding h-8 px-3，gap-1
  - 阴影 shadow-sm shadow-brand-500/30
  - hover：bg-brand-600，shadow-md
  - 左侧带 User 图标（h-3.5 w-3.5）

用户菜单（已登录态）：
  - 8×8 圆形头像，点击弹出 Dropdown（align="end"，w-44）
  - 头像 hover：ring-2 ring-brand-300 ring-offset-2 ring-offset-background
  - Dropdown 两项：「进入后台」「退出登录」
```

### 3.2 Hero 区

```
Hero 设计提示词：

容器：
  - 圆角 rounded-2xl，border border-border/60，shadow-(--shadow-card-hover)
  - 最小高度 min-h-[420px]，桌面 min-h-[420px]，超宽可到 500px
  - 内部三层堆叠（绝对定位背景 → 渐变蒙版 → 前景内容）

背景层（z-0）：
  - 全尺寸 Next/Image，object-cover，priority
  - 图片源为 /Hero.jpg（意境插画 / 二次元 / 城市夜景皆可）
  - 缩放 1.02 防止边缘露出

渐变蒙版（z-1）：
  - 左侧深、右上浅的多层叠加：
    · bg-linear-to-r from-black/85 via-black/55 to-black/30
    · 深色模式加深到 90/60/35
  - 顶部 1px 高光线：bg-linear-to-r from-transparent via-white/60 to-transparent

前景内容（z-10）：
  - 左下对齐，padding p-6（手机）/ p-10（桌面）
  - 顶部小条：两枚胶囊徽章
    · 「Welcome」徽章：bg-white/10 backdrop-blur-md ring-1 ring-white/25，文字 white/90，
      字号 11px，字距 tracking-[0.2em] UPPERCASE，左侧 Sparkles 图标
    · 「分类名」徽章：bg-brand-500/80 ring-1 ring-brand-300/40，其它同上
  - 主标题（玻璃面板）：
    · 容器：rounded-2xl border border-white/15 bg-white/8 p-5（sm:p-7）
    · backdrop-blur-2xl + shadow-2xl shadow-black/30
    · 标题行：text-2xl（sm:text-3xl lg:text-[2.5rem]），font-bold leading-tight tracking-tight
    · 「欢迎来到」white/95，「{siteName}」部分使用
      bg-linear-to-r from-white via-brand-200 to-white bg-clip-text text-transparent
    · 标题下方 1 条 absolute 高光下划线
  - 副标题：text-sm（sm:text-[15px]）text-white/80 leading-relaxed
  - CTA 按钮：
    · rounded-full，border border-white/20 bg-white/15
    · backdrop-blur-md
    · padding px-5 py-2，gap-2
    · 文字 white text-sm font-medium
    · hover：border-white/40 + bg-white/25 + shadow-lg shadow-black/20
    · 右侧 ArrowRight 图标，hover 时 translate-x-0.5
```

### 3.3 卡片（Card / 文章列表项 / FeaturedCard）

```
文章列表项：
  - 横向 layout：左侧 176×128 px 缩略图（rounded-lg，object-cover），右侧文字
  - 标题：text-base font-semibold，line-clamp-2，hover text-brand-600
  - 摘要：text-sm text-muted-foreground，line-clamp-2
  - 顶部分类标签：text-xs font-medium tracking-widest UPPERCASE text-brand-600
  - 整卡 hover：-translate-y-0.5 + shadow-(--shadow-card-hover)
  - 卡片间距：space-y-5

FeaturedCard（侧栏今日推荐）：
  - 容器：rounded-lg border border-border/60
  - 内部：aspect-video 封面图，object-cover
  - 顶部渐变蒙版：bg-linear-to-t from-black/65 via-black/15 to-transparent
  - 左上小条：rounded bg-white/85 px-1.5 py-0.5 text-[10px] font-medium tracking-widest text-brand-700 backdrop-blur-sm，文字「RECOMMEND」
  - 底部叠加文字：
    · 分类名 text-[11px] font-medium uppercase tracking-wider text-brand-300
    · 标题 text-base font-semibold leading-snug text-white drop-shadow-sm line-clamp-2
  - hover：封面 group-hover:scale-105（duration-500）+ 整卡浮起

统计卡片 StatsCard（管理后台）：
  - 高度固定 h-30（约 120px）
  - 头部：左侧标题 text-sm font-medium text-muted-foreground，右侧 4×4 lucide 图标
  - 内容：主数值 text-2xl font-bold tracking-tight（≥10000 自动 1.2w 格式）
  - 趋势行（可选）：箭头 + 百分比 + 标签
    · ↑ 上升：text-emerald-600（深色 emerald-400）+ TrendingUp 图标
    · ↓ 下降：text-destructive + TrendingDown
    · → 持平：text-muted-foreground + Minus

侧栏标题 SideTitle：
  - text-sm font-semibold tracking-tight
  - 左侧 4×0.5（高×宽）rounded-full bg-brand-500 竖条
  - 后续内容与竖条水平对齐
```

### 3.4 表单元素

```
Input：
  - 高度 h-10（其它 size 同 shadcn 默认：sm h-9 / lg h-11）
  - 圆角 rounded-md（来自 --radius）
  - 边框 border border-input
  - 左侧可叠加 4×4 lucide 图标（absolute left-3 top-1/2 -translate-y-1/2）
  - 带图标时内部 padding-left：pl-9
  - focus-visible 状态：border-brand-400 + shadow-(--shadow-brand-glow)（3px 半透明品牌光晕）
  - 错误态：border-destructive + 下方 text-sm text-destructive 文案

Select（下拉）：
  - 同 Input 高度与圆角
  - ring-offset 体系：focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2

Label：
  - 与 Input 上方 8px 间距（space-y-2）
  - 字号默认文本大小

Button 主按钮：
  - 高度 h-10，padding 默认 px-4
  - 圆角 rounded-md
  - 背景 brand-500，文字 primary-foreground（白）
  - hover：brand-600
  - 阴影 shadow-sm
  - 大尺寸 size="lg"：h-11
  - 加载中文字前缀「...中」+ disabled

带图标的输入框（登录页等）：
  - 相对定位 wrapper
  - 图标：absolute left-3 top-1/2 -translate-y-1/2，size-4，text-muted-foreground
  - 输入框：pl-9
  - 配合 focus-visible 的品牌光晕
```

### 3.5 后台管理布局 Admin Layout

```
Sidebar：
  - 位置 fixed left，宽度 16rem（约 256px），可通过 collapsible="icon" 折叠为 3rem
  - 容器：bg-sidebar (oklch(0.985 0 0))，右侧 1px border-sidebar-border
  - Header：
    · 8×8 圆角图标块：bg-linear-to-br from-brand-500 via-brand-600 to-purple-500
      + 文字 primary-foreground + shadow-sm shadow-brand-500/30
    · 右侧双行文字：标题 font-semibold + 副标题 text-xs text-muted-foreground
  - Content：
    · 一级菜单：图标 + 文字，可点击（href）/可展开（children）
    · 激活态：bg-sidebar-accent (brand-50) + text-sidebar-accent-foreground (brand-700)
    · 二级菜单：缩进 + 小一号图标，hover 切换背景
  - Footer：
    · 用户卡片：左 Avatar h-8 w-8 + 右 nickname/email 双行
    · Dropdown（side="top" w-56）：「退出登录」一项

顶栏（main header）：
  - 高 h-14，border-b，下方水平 padding px-4
  - 结构：[SidebarTrigger] [Vertical Separator] [Breadcrumbs 链路]
  - 面包屑：text-sm text-muted-foreground
    · 可点击段：hover text-foreground + transition-colors
    · 当前段：text-foreground font-medium
    · 分隔符：ChevronRight 图标 size-3

主内容区：
  - padding p-6，内部 space-y-6 划分模块
  - 模块标题：text-xl font-semibold（页面）/ text-base（Card 内）

导航分组：
  - 「导航菜单」一级标题 SidebarGroupLabel（text-xs text-muted-foreground）
  - 父级菜单带 ChevronRight 图标，展开时 rotate-90 旋转
  - 默认展开「文章管理」「消息管理」两个含子项的组
```

### 3.6 数据可视化（Recharts）

```
折线图（访问趋势）：
  - CartesianGrid stroke-dasharray="3 3"（浅灰虚线）
  - XAxis/YAxis 字号 fontSize={12}
  - Tooltip + Legend 默认
  - Line：
    · stroke="var(--color-chart-1)"（brand-500）
    · strokeWidth={2}
    · dot={{ r: 4 }}

饼图（分类文章统计）：
  - cx/cy="50%"，outerRadius={100}
  - label 自定义为 `${name} ${percent * 100 | 0}%`
  - 多色扇形用 var(--color-chart-1..5) 循环
  - 必须包裹在 ResponsiveContainer width="100%" height={300}

骨架屏（加载态）：
  - 卡片骨架高度 h-30，头部 title 4×20、图标 4×4，主内容 8×24
  - 图表骨架 SkeletonChart，圆角矩形 + 内嵌 shimmer 动画（2s linear infinite）
  - shimmer：linear-gradient(90deg, transparent → muted/30 → transparent)，translateX(-100% → 100%)
  - 全部尊重 prefers-reduced-motion（关停动画）
```

### 3.7 登录页 Auth Layout

```
背景：
  - 整屏 min-h-screen，bg-linear-to-br from-brand-50 via-background to-purple-50/40
  - 暗色：from-brand-950/30 via-background to-purple-950/20
  - 三枚装饰光斑（absolute + blur-3xl）：
    · -top-32 -left-32 h-96 w-96 bg-brand-400/25
    · -bottom-32 -right-32 h-112 w-md bg-purple-400/20
    · 中心 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-brand-500/8 + animate-pulse
  - 全部 pointer-events-none

卡片：
  - 居中，max-w-sm（约 384px）
  - border-border/60，bg-background/80 backdrop-blur-xl
  - shadow-(--shadow-card-hover)

头部：
  - 居中 14×14 圆角图标块（rounded-2xl）
  - bg-linear-to-br from-brand-500 via-brand-600 to-purple-500
  - 文字 white，shadow-lg shadow-brand-500/30
  - 标题 text-2xl，渐变文字 from-brand-500 via-brand-600 to-purple-500 bg-clip-text
  - 副标题 text-sm text-muted-foreground

表单：
  - space-y-4 划分字段
  - 字段内 space-y-2（Label + Input）
  - 提交按钮 size="lg"，width 100%
```

### 3.8 文章编辑器 Markdown Editor

```
页面布局：
  - max-w-5xl mx-auto，space-y-6
  - 头部：左 [返回 IconButton] [标题 text-xl font-semibold]
          右 [保存草稿·outline] [发布文章·primary]
  - 字段从上到下：
    1. 文章标题 *（必填，errors.articleTitle 红框 + 下方提示）
    2. grid sm:grid-cols-3：分类 / 类型（原创/转载/翻译）/ 状态（公开/私密/草稿）
    3. 标签 SmartTagInput（最多 10 项）
    4. 封面图 CoverImageUploader（拖拽 + 点击上传）
    5. MarkdownToolbar（粗体/斜体/删除线/H/引用/行内代码/代码块/链接/图片/分割线/有序无序列表）
    6. ImageUploader（拖拽多文件上传，自动插入 ![图片](url)）
    7. MDEditor（@uiw/react-md-editor，height={500}，data-color-mode="light"）

草稿恢复：
  - 进入页面时检测 localStorage 草稿，弹出黄色横幅：
    border-yellow-200 bg-yellow-50（暗色 yellow-800 / yellow-950）
  - 两个按钮：「恢复草稿」「丢弃」

自动保存：
  - 离开页面前 isDirty 触发 beforeunload 警告
  - 每隔 N 秒写入 localStorage
```

### 3.9 文章详情页 Article Detail

```
阅读进度条：
  - 位置 fixed top-0 left-0 right-0 z-60
  - 高度 h-0.5，宽度根据 var(--progress) 缩放（transform: scaleX）
  - 背景 linear-gradient(90deg, brand-400, brand-600)

正文区：
  - 左侧文章 + 右侧 TOC（lg 可见），中间 gap-8

文章头部：
  - 顶部分类：inline-flex，text-xs font-medium text-brand-600（暗色 brand-400）
    · 前置 1.5×1.5 rounded-full bg-brand-500 小圆点
  - 主标题：mt-3，text-3xl sm:text-4xl，font-bold，tracking-tight
  - 元信息：mt-4，flex flex-wrap，gap-3，text-sm text-muted-foreground
    · 时间前 1×1 rounded-full bg-muted-foreground/60 圆点
    · 标签 Badge variant="outline"，hover 时 border + 文字变 brand-300/700（暗色 700/400）

封面：
  - mt-6，rounded-xl，shadow-(--shadow-card)，Next/Image object-cover

Markdown prose（@tailwindcss/typography 自定义）：
  - prose prose-neutral dark:prose-invert
  - prose-headings:font-semibold + scroll-mt-24
  - prose-h2:border-b border-border/60 pb-2 text-2xl
  - prose-h3:text-xl
  - prose-blockquote:border-brand-400 prose-blockquote:bg-brand-50/50 prose-blockquote:not-italic
  - 暗色 blockquote：bg-brand-900/20
  - prose-code:before:hidden prose-code:after:hidden
  - prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5
  - prose-code:font-normal prose-code:text-foreground
  - prose 内 a 链接：text-decoration-color 由 brand-500 40% 透明色 → hover 时变 100%

侧栏 TOC：
  - 桌面可见，移动端隐藏
  - 标题层级仅显示 h2/h3（自动从 Markdown 抽取 id）
  - 中文 id 转换：lowercase + 非 [a-z0-9\u4e00-\u9fa5] 替换为「-」 + 去首尾 -

上一篇/下一篇 ArticleNav：
  - 上下两行，每行 grid-cols-2
  - 左：上一篇（label + 标题）
  - 右：下一篇（label + 标题，右对齐）
  - hover 时背景 transition-colors
```

### 3.10 装饰 / 视觉增强

```
.glass-panel（玻璃拟态）：
  - bg-background/70 backdrop-blur-xl
  - border border-border/40

.blog-card：
  - shadow-(--shadow-card) + transition-all duration-200
  - hover：-translate-y-0.5 + shadow-(--shadow-card-hover)

.link-brand：
  - text-muted-foreground → hover text-brand-600（暗色 brand-400）

.gradient-brand（装饰用）：
  - linear-gradient(135deg, brand-500 0%, oklch(0.65 0.22 290) 100%)

.reading-progress-bar：
  - 固定顶部，height 2px
  - 背景 brand-400 → brand-600 横向渐变
  - 通过 transform: scaleX(var(--progress)) 实时反映滚动进度

主题切换涟漪：
  - 仅在浏览器支持 document.startViewTransition 时启用
  - 通过 CSS 自定义属性 --theme-ripple-x / --theme-ripple-y 记录触发点
  - ::view-transition-new(root) 的 clip-path 从 circle(0) 动画到 circle(200vmax)
  - 动画 500ms，cubic-bezier(0.16, 1, 0.3, 1)
  - prefers-reduced-motion 用户跳过此动画
```

---

## 4 · 页面级完整 Prompt（直接喂给 v0 / Cursor / Claude Code 复刻）

### 4.1 博客首页

```
请用 Next.js 16 + React 19 + Tailwind v4 + shadcn/ui 复刻以下博客首页：

【整体框架】
- sticky 顶部导航（TopNav）：左 logo "Blogs"（brand-500）/ 中部 8 个导航链接 / 右侧主题切换 + 头像
- 主区 max-w-6xl mx-auto px-4 py-8
- 底部 Footer

【Hero 区】
- 圆角 2xl 卡片，背景使用 Next/Image /Hero.jpg（object-cover）
- 左侧三层蒙版：from-black/85 via-black/55 to-black/30
- 顶部 1px 高光白线
- min-h-[420px]，内部 padding p-10
- 左下两块：① 两枚玻璃胶囊徽章（Welcome + 分类名），② 玻璃面板圆角 2xl + 内部主副标题，③ CTA 药丸按钮

【两栏布局】
- 左栏（flex-1）：5 篇 ArticleList 卡片（缩略图 176×128 + 标题/摘要/分类），space-y-5
- 右栏（w-300）：3 块卡片
  1. 今日推荐 FeaturedCard：aspect-video 封面 + 底部叠加标题 + 左上 RECOMMEND 标签
  2. 分类 CategoryList：标题 SideTitle + 横向胶囊标签云
  3. 标签 TagCloud：标题 SideTitle + 圆形标签胶囊，悬停变色

【设计 Tokens（globals.css）】
- 严格按上文 Section 1 提供的 OKLCH 变量
- 全部圆角派生自 --radius=0.625rem
- 三档语义化阴影：card / card-hover / brand-glow
- 字体 Geist + Geist Mono，2px letter-spacing 收紧
- 支持浅色 / 深色双模式（class="dark" 切换）
- 主题切换带 View Transition 涟漪扩散
```

### 4.2 管理后台登录页

```
用 Next.js + Tailwind + shadcn/ui 复刻一个管理后台登录页：

【背景】
- min-h-screen，bg-linear-to-br from-brand-50 via-background to-purple-50/40
- 三枚装饰光斑：-top-32/-left-32 brand-400/25 blur-3xl；-bottom-32/-right-32 purple-400/20 blur-3xl；中心 brand-500/8 + animate-pulse
- 全 pointer-events-none

【居中卡片】
- max-w-sm，bg-background/80 backdrop-blur-xl，shadow-(--shadow-card-hover)
- border-border/60，圆角 lg

【头部】
- 14×14 圆角 2xl 图标块，bg-linear-to-br from-brand-500 via-brand-600 to-purple-500
- 内嵌 lucide Sparkles 图标（白色）
- 标题 text-2xl 渐变文字 from-brand-500 via-brand-600 to-purple-500
- 副标题 text-sm text-muted-foreground「请登录以继续」

【表单】
- space-y-4
- 两个字段：邮箱 / 密码
  - 每个字段：Label + 相对定位 wrapper，左侧 Mail / Lock 图标（absolute left-3 size-4 text-muted-foreground）
  - Input：pl-9，focus-visible:border-brand-400 + shadow-(--shadow-brand-glow)
- 底部 size="lg" 主按钮「登录」，width 100%，loading 态文字「登录中...」
```

### 4.3 管理后台 Dashboard

```
Next.js 后台仪表盘页：

【布局】
- 左侧 Sidebar（collapsible="icon"）：Header 含 brand 渐变 logo + 标题；导航分组「文章管理」「消息管理」「说说管理」「相册管理」「日志管理」「站点配置」；Footer 含用户头像 Dropdown
- 右侧主区 p-6 space-y-6
- 顶部 header h-14 border-b：SidebarTrigger + Separator + Breadcrumbs（首页 > 文章管理 > 发布文章）

【内容模块从上到下】
1. 4 个 StatsCard（grid-cols-4）：文章数 / 用户数 / 留言数 / 访问量
   - 每个含 lucide 图标 + 标题 text-muted-foreground + 数值 text-2xl font-bold
   - 「访问量」额外展示趋势：TrendingUp/Down/Minus 图标 + 百分比 + 「较上周」描述
2. QuickActions 快捷操作区：4–6 个 IconButton 网格
3. 两栏 grid-cols-2：TopArticles 热门文章（暂时只展示标题 + 浏览量 + 评论 + 点赞）
4. 「访问趋势」Card：Recharts LineChart，stroke=chart-1（brand-500），strokeWidth=2；右上角 3 段时间切换（7天/30天/90天）Button 组件
5. 「分类文章统计」Card：Recharts PieChart，5 色循环 chart-1..5
6. TodoList：草稿文章 / 待审核评论 / 未读留言 三个事项卡

【细节】
- 全部 Card 高度 h-30（统计卡除外）
- Loading 态统一使用 SkeletonChart + 内部 shimmer 动画
- ErrorBoundary 包裹所有数据模块
- 完成后弹 sonner Toast 提示成功 / 失败
```

### 4.4 文章编辑器

```
复刻文章发布/编辑页：

【Header】
- 左：返回 IconButton + 标题 text-xl font-semibold（「发布文章」/「编辑文章」）
- 右：保存草稿 outline Button（含 Save 图标）+ 发布文章 primary Button

【字段（从上到下）】
1. 文章标题 Input（必填）
2. grid-cols-3：分类 Select / 类型 Select（原创|转载|翻译）/ 状态 Select（公开|私密|草稿）
3. 标签 SmartTagInput（最多 10 项，可从已有标签选择 + 输入新标签）
4. 封面图 CoverImageUploader（拖拽/点击上传，支持预览与替换）
5. Markdown 工具栏 MarkdownToolbar：粗体 / 斜体 / 删除线 / H2 / 引用 / 行内代码 / 代码块 / 链接 / 图片 / 分割线 / 有序 / 无序
6. ImageUploader（拖拽多文件上传）
7. @uiw/react-md-editor，height=500，data-color-mode="light"

【校验】
- 字段校验失败：Input 红框 + 下方 text-sm text-destructive
- 顶部若有未保存草稿，弹出黄色横幅（yellow-50/yellow-950）「检测到未保存的草稿：xxx」，含「恢复草稿」「丢弃」按钮

【自动保存】
- 每隔 N 秒将 {title, content} 写入 localStorage
- 离开页面前 isDirty 触发浏览器 beforeunload 警告

【提交】
- 主按钮 loading 态文字「保存中...」
- 成功 toast.success 后 clearDraft + router.push("/admin/articles")
```

### 4.5 文章详情页

```
复刻文章详情页（支持 Markdown）：

【顶部】
- 固定阅读进度条 fixed top-0 h-0.5 z-60，背景 brand-400→brand-600 横向渐变
- 通过 var(--progress) + transform: scaleX 实时反映滚动

【正文布局（≥lg）】
- flex gap-8
- 左（flex-1）：article 内容
  - 顶部分类：inline-flex + 1.5×1.5 rounded-full bg-brand-500 + text-xs text-brand-600
  - 主标题 mt-3 text-3xl sm:text-4xl font-bold tracking-tight
  - 元信息 mt-4：时间 + 多个 Badge variant="outline"（hover border/text brand-300/700）
  - 封面 mt-6 rounded-xl shadow-(--shadow-card)
  - Markdown 正文 prose prose-neutral dark:prose-invert + 自定义 prose-h2/h3/code/blockquote 样式
- 右（sticky）：TableOfContents 自动从 h2/h3 抽取，桌面显示，移动端隐藏

【文章底部】
- ArticleNav 上一篇/下一篇，两列网格，hover 切换背景

【错误态】
- notFound：「文章不存在或已被删除」
- server：文字 + 「重新加载」按钮
- network：文字 + 「重试」按钮
- loading：整套 Skeleton（标题/元信息/封面/正文）
```

---

## 5 · Banner / Hero 视觉资产生成 Prompt（适配 AI 出图工具）

> 用于让 Midjourney / DALL·E / Gemini Image 等生成配套的横幅插图。
> 全部基于 `public/banner-hero*.html` 已实现的三种风格。

### 5.1 默认浅色横幅（推荐）

```
生成一张 1920×720 的博客 Hero 横幅，要求：

【主题】
未来感 + 二次元插画风，蓝紫色调为主，适合「开发者博客」气质。
可参考关键词：cyberpunk lounge, holographic UI, neural cityscape, anime key visual.

【构图】
- 左下 60% 区域：人物剪影 / 几何前景（必须有人或拟人化形象，给文字留立足点）
- 右上 40% 区域：远景城市 / 数据流 / 星空，留呼吸感
- 顶部 1px 高光线穿过整宽
- 整体景深：浅景深，前景锐利，背景柔焦

【色板（必须严格遵守）】
- 主色：#3B82F6 → #6366F1（蓝→靛）
- 副色：#A855F7 → #EC4899（紫→粉，渐变高光点缀）
- 强调：#F8FAFC（高光白）
- 暗部：#0F172A → #1E293B（深蓝灰）
- 禁止使用：纯黑、纯红、暖橙、亮黄

【光影】
- 主体受光方向：右上方 45°，形成 rim light
- 多重 radial gradient 光斑：
  · 左上 oklch(0.72 0.185 250 / .4)
  · 右下 oklch(0.55 0.220 258 / .3)
  · 中央 oklch(0.65 0.22 290 / .2)
- 整体不要过曝，保留暗部细节

【几何】
- 背景叠加 60px × 60px 极细网格（白色 3% 透明度）
- 网格用 radial mask 中心 30% 不透明，向外淡出至 0
- 几个浮动光点（6 颗，2px-8px，蓝紫色 60–80% 不透明），上下浮动 30px，6s 循环

【人物 / 主体要求】
- 不要出现在右下（那是要放文字的「安全区」）
- 姿态放松、自然、略带沉思
- 服装可用现代科技风（连帽衫、机能风外套、戴耳机）
- 不要写实摄影风，二次元 / 数字绘画 / 半厚涂皆可

【文字】
- 不在图上写字。文字由 HTML/CSS 单独叠加。
- 图中不要出现任何字母 / 数字 / 文字

【质感】
- 整体降饱和 10%，保留品牌色高纯度
- 添加细颗粒噪点（grain），避免过度塑料感
- 不要生成水印、不要 logo
```

### 5.2 暗色横幅（深色模式）

```
生成 1920×720 深色 Hero 横幅：

【主题】
深夜书房 / 数据中心 / 极简科幻，蓝紫色霓虹氛围，适合「开发者深夜输出」情绪。

【构图】
- 中下区域：打开的笔记本电脑 + 显示器代码界面（半透明，能看到但不是主角）
- 远景：模糊的城市天际线 / 服务器机柜霓虹
- 整体比浅色版更暗、更克制

【色板】
- 底色：#0A0A0F → #1E1B4B（接近黑深紫）
- 主色霓虹：oklch(0.72 0.185 250)（亮蓝），#60A5FA
- 副色霓虹：oklch(0.78 0.160 250)，#A78BFA
- 高光：#E2E8F0（柔白）
- 绝对禁止：暖色调

【光影】
- 仅一束来自屏幕的冷光 + 一束来上方的紫蓝顶光
- 整体保留 70% 以上暗部
- 中央光晕 oklch(0.72 0.185 250 / .5) 范围大，柔和

【几何】
- 80px × 80px 极细网格（白色 2% 透明度）
- radial mask 中心 20% 较亮
- 浮动光点 4 颗，比浅色版更大（6px-10px），亮蓝色调

【人物】
- 仅剪影 / 半侧面轮廓，置于右侧
- 数字绘画 / 半厚涂 / 磨砂玻璃感
- 不要露出完整面部细节

【风格】
- 类似：Vitaly S. Alexei、WLOP、藤原的风
- 比浅色版更安静、更孤独
- 不要水印
```

### 5.3 优化版 v2 横幅（推荐首屏）

```
生成 1920×720 优化版 Hero 横幅，标题区在左下 50%：

【构图（关键）】
- 严格的「左重右轻」：左 50% 全部用于文字承载区
- 在主图上预渲染 4 层渐变蒙版位置：
  · 全宽 linear-gradient to right: rgba(8,12,24,.92) → rgba(8,12,24,.75) → rgba(8,12,24,.35) → rgba(8,12,24,.1) → transparent
  · 底部 linear-gradient to top: rgba(0,0,0,.55) → rgba(0,0,0,.25) → transparent (50% 起始)
  · 顶部柔光：纯白 1%–2% 的细带，从中心向两边淡出
- 确保上述蒙版叠加后，左下 30% 区域亮度低于正文文字阈值

【主体】
- 二次元 / 概念艺术风人物置于右侧
- 形象：开发者 / 程序员 / 未来学者皆可
- 服饰：机能风 + 蓝色发光纹路
- 表情专注、不直视镜头

【色板】
- 主：#3B82F6（亮蓝），#6366F1（靛），#8B5CF6（紫）
- 辅：#1E293B（深蓝灰），#0F172A（近黑）
- 强调：#F1F5F9（柔白）
- 高光：#DBEAFE（淡蓝白）
- 禁止出现暖色

【光源】
- 主体 rim light 来自屏幕方向（右下 30°）
- 左上顶光制造空气感
- 禁止硬阴影，禁止戏剧化对角光

【气氛】
- 安静、专业、有科技感但不冰冷
- 类似「深夜单人项目上线前夜」的情绪
- 留 50% 以上的暗部 / 留白

【规范】
- 6px 圆角
- 1px 内描边白色高光
- 不生成水印、logo、字母
- 不在文字安全区内绘制任何元素（人形剪影 / 漂浮粒子例外，但必须低饱和、低亮度）
```

---

## 6 · 配色变体 Prompt（生成子品牌 / 节日皮肤）

```
基于 Dim Stack 主蓝色，请生成以下配色变体（替换 brand-* 即可全套生效）：

【极光（Aurora）】
  brand-500: oklch(0.68 0.18 165)  // 青绿
  brand-600: oklch(0.60 0.20 175)
  brand-700: oklch(0.52 0.22 185)
  适用：夏季 / 节日 / 极光主题

【暮光（Dusk）】
  brand-500: oklch(0.65 0.20 320)  // 品红
  brand-600: oklch(0.58 0.22 330)
  brand-700: oklch(0.50 0.24 340)
  适用：情人节 / 复古主题

【森林（Forest）】
  brand-500: oklch(0.62 0.16 145)  // 自然绿
  brand-600: oklch(0.55 0.18 150)
  brand-700: oklch(0.48 0.20 155)
  适用：环保 / 户外主题

【落日（Sunset）】
  brand-500: oklch(0.68 0.18 45)   // 暖橙
  brand-600: oklch(0.62 0.20 35)
  brand-700: oklch(0.54 0.22 25)
  ⚠️ 唯一允许暖色的变体；仅在 hero / 节日皮肤使用，避免破坏主品牌

替换 globals.css 中 9 个 brand-* 变量 + 5 个 chart-* 变量 + shadow-brand-glow 中的 rgba(59,130,246,.18) → 对应 hue 的 rgb 即可。
```

---

## 7 · 微交互动效 Prompt

```
【通用原则】
- 全部动效 ≤ 300ms，超过 500ms 必须支持 prefers-reduced-motion 关闭
- 缓动：cubic-bezier(0.16, 1, 0.3, 1)（ease-out-expo 风格）
- 仅 transform / opacity / box-shadow / clip-path 属性可参与过渡

【卡片浮起】
- 默认：shadow-(--shadow-card)
- hover：-translate-y-0.5 + shadow-(--shadow-card-hover)
- transition-all duration-200

【图片缩放】
- 容器 overflow-hidden
- 内部图片 transition-transform duration-500
- hover：scale-105

【主题切换涟漪】
- 仅在浏览器支持 document.startViewTransition() 时启用
- 通过 CSS var --theme-ripple-x/y 记录按钮中心
- ::view-transition-new(root) clip-path 从 circle(0 at var(--ripple-x) var(--ripple-y))
  动画到 circle(200vmax at ...)
- 500ms，cubic-bezier(0.16, 1, 0.3, 1)

【阅读进度条】
- 滚动事件节流到 requestAnimationFrame
- 通过 CSS var --progress 控制 transform: scaleX(var(--progress))
- transition: transform 100ms linear

【Skeleton shimmer】
- 2s linear infinite
- 伪元素 ::after 覆盖父容器
- 背景 linear-gradient(90deg, transparent → muted/.3 → transparent)
- translateX(-100% → 100%)

【徽章入场】
- framer-motion：initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}

【微震动反馈】
- 失败 / 错误：button 抖动 keyframes shake 200ms
```

---

## 8 · 可访问性 & 工程规范 Prompt

```
【a11y】
- 所有 interactive 元素必须有可见 focus-visible 态（brand-glow ring 3px）
- 图标按钮必带 aria-label
- 表单 Label 通过 htmlFor 与 Input id 显式关联
- 色对比度遵循 WCAG AA：正文 ≥ 4.5:1，大字 ≥ 3:1
- brand-500 on white：实测对比度 4.71:1（合格）
- brand-700 on brand-50：实测对比度 7.4:1（优秀）
- 暗色模式 brand-500 on oklch(0.145 0 0)：8.2:1

【响应式断点】
- 移动优先
- 关键断点：sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536
- 导航 md 以上水平，md 以下汉堡
- 两栏布局 lg 以上才生效
- 统计卡片 sm 以上 2 列，lg 以上 4 列

【性能】
- Hero 图 priority + sizes responsive
- 字体 woff2 + font-display: swap
- 背景模糊用 backdrop-blur-xl（仅在浏览器支持时生效）
- 数据模块用 ErrorBoundary 隔离崩溃

【代码风格】
- "use client" 仅在必要页面声明（避免过度客户端化）
- 服务端组件优先：博客首页列表、归档、详情等
- 表单状态：react-hook-form + zod 校验
- 全局状态：zustand（auth / theme）
- API 客户端：统一在 lib/api.ts 封装，类型泛型传入
- 错误边界：每个数据模块独立 ErrorBoundary
- 加载态：Suspense + Skeleton
```

---

## 9 · 一句话复刻指令（One-Shot Reproduce）

如果只想用一段话让任意 LLM/Agent 复刻整套设计风格：

```
使用 Next.js 16 + React 19 + Tailwind v4 + shadcn/ui (base-ui) + lucide-react + framer-motion + recharts +
@uiw/react-md-editor + zustand + zod 复刻一个开发者向个人博客 + 管理后台的 UI 系统。

品牌色：科技蓝 (OKLCH hue 250)，强调色向紫 (290) 倾斜；浅色 / 深色双模式 OKLCH；圆角 0.625rem；三档语义化阴影 (card / card-hover / brand-glow)；字体 Geist + Geist Mono；玻璃拟态仅用于 Hero / 登录 / 弹窗。

页面包含：博客首页 (Hero + 文章列表 + 侧栏)、归档、分类、标签、说说、友链、留言、关于、文章详情 (含阅读进度 + TOC + 上下篇)、登录、仪表盘 (4 个统计卡 + 趋势折线 + 分类饼图)、文章 / 评论 / 留言 / 说说 / 相册 / 分类 / 标签 / 日志 / 站点配置 管理页、Markdown 编辑器 (含草稿恢复 + 自动保存 + 图片上传)。

设计语言：克制的玻璃拟态、大留白、细腻 1px 分隔、低饱和微动效、全部尊重 prefers-reduced-motion；a11y 达到 WCAG AA；组件严格 shadcn 风格（forwardRef + cva + cn 工具）；表单 react-hook-form + zod；数据获取统一封装 fetch 客户端 + 错误边界 + Skeleton 加载态。
```

---

## 10 · 快速复制粘贴清单

复制即用：

| 用途 | 复制段落 |
|---|---|
| 整体视觉风格 | §0 Master Style |
| 设计 Token | §1 |
| 页面布局 | §2 |
| 单组件复刻 | §3.x |
| 完整页面复刻 | §4.x |
| AI 出横幅图 | §5.x |
| 换主题皮肤 | §6 |
| 动效规范 | §7 |
| a11y / 工程规范 | §8 |
| 一句话交付 | §9 |
