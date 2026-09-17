# 博客前端 UI/UX 设计规范（详细版）

> 基于 **次元栈 · Dim Stack** 项目提炼的完整 UI/UX 规范，供后续博客前端开发参考。
> 本规范**仅聚焦视觉与交互**（不涉及后端实现、状态管理、具体业务逻辑）。
> 内容覆盖：设计系统、前台门户、后台 Dashboard、音乐播放器、图片灯箱、Markdown 编辑器、表单、加载/错误/空态等全场景。

---

## 目录

- [0. 设计哲学速览](#0-设计哲学速览)
- [1. 设计系统（Design System）](#1-设计系统design-system)
- [2. 全局布局](#2-全局布局)
- [3. 路由结构](#3-路由结构)
- [4. 前台门户组件](#4-前台门户组件)
- [5. 后台 Dashboard 模块](#5-后台-dashboard-模块)
- [6. 全局元素](#6-全局元素)
- [7. 暗色模式](#7-暗色模式)
- [8. 响应式断点](#8-响应式断点)
- [9. 微交互与动效汇总](#9-微交互与动效汇总)
- [10. 可访问性](#10-可访问性)
- [11. 错误/空/加载状态规范](#11-错误空加载状态规范)
- [12. 复用资产清单](#12-复用资产清单)
- [附录 A：图标策略](#附录-a图标策略)
- [附录 B：常用 Tailwind 类速查](#附录-b常用-tailwind-类速查)
- [附录 C：键盘快捷键汇总](#附录-c键盘快捷键汇总)

---

## 0. 设计哲学速览

| 关键词 | 描述 |
| --- | --- |
| **清爽留白** | 大量灰色背景 + 白色卡片阴影，弱化分隔线 |
| **蓝灰主色** | 主操作蓝（blue-500/blue-600），文本以中性灰阶为主 |
| **内容优先** | 卡片化布局，弱化边框、突出排版与图片 |
| **柔和过渡** | 全局以 200–300ms ease 过渡，避免突兀动画 |
| **响应式优先** | 桌面两栏/移动单栏，所有组件具备 Mobile-First 行为 |
| **玻璃态点缀** | 弹层、播放器等使用 `backdrop-blur` + 半透明白底 |
| **状态友好** | 所有异步操作都有 loading/error/empty 三态视觉 |

---

## 1. 设计系统（Design System）

### 1.1 颜色 Token

#### 浅色模式（默认）

| 用途 | 类名 | HEX |
| --- | --- | --- |
| 页面背景 | `bg-gray-50` | `#F9FAFB` |
| 卡片/容器 | `bg-white` | `#FFFFFF` |
| 卡片次级背景 | `bg-gray-50 / bg-gray-100` | `#F9FAFB / #F3F4F6` |
| 一级文字（标题） | `text-gray-900` | `#111827` |
| 二级文字（正文） | `text-gray-700` | `#374151` |
| 弱文字（描述） | `text-gray-600` | `#4B5563` |
| 提示文字 | `text-gray-500` | `#6B7280` |
| 占位/disabled | `text-gray-400` | `#9CA3AF` |
| **主色（强调）** | `bg-blue-500` | `#3B82F6` |
| 主色悬停 | `hover:bg-blue-600` | `#2563EB` |
| 主色按下 | `active:bg-blue-700` | `#1D4ED8` |
| 主色文字 | `text-blue-600` | `#2563EB` |
| 主色悬停文字 | `hover:text-blue-700` | `#1D4ED8` |
| 选中态背景 | `bg-blue-100` | `#DBEAFE` |
| 选中态文字 | `text-blue-800` | `#1E40AF` |
| 主色 50 背景 | `bg-blue-50` | `#EFF6FF` |
| 主色 400（站点名） | `text-blue-400` | `#60A5FA` |
| 成功 | `bg-green-100 / text-green-800` | `#D1FAE5 / #065F46` |
| 警告 | `bg-yellow-50 / text-yellow-800` | `#FFFBEB / #92400E` |
| 危险 | `bg-red-500 / bg-red-50 / text-red-800` | `#EF4444 / #FEF2F2 / #991B1B` |
| 信息 | `bg-blue-50` | `#EFF6FF` |
| 卡片边框 | `border-gray-200` | `#E5E7EB` |
| 输入边框 | `border-gray-300` | `#D1D5DB` |
| 输入框背景 | `bg-white` | `#FFFFFF` |
| 浅灰 hover | `hover:bg-gray-50 / 100` | `#F9FAFB / #F3F4F6` |

#### 暗色模式（`.dark` 作用域）

| 用途 | HEX |
| --- | --- |
| 页面背景 | `#111827` |
| 卡片背景 | `#1F2937` |
| 输入框背景 | `#374151` |
| 主色悬停 | `#60A5FA` |
| 主色文字 | `#93C5FD` |
| 主色按下 | `#1D4ED8` |
| 选中态背景 | `#1E3A8A` |
| 选中态文字 | `#93C5FD` |
| 主色 50 背景 | `rgba(59,130,246,0.12)` |
| 一级文字 | `#F9FAFB` |
| 二级文字 | `#E5E7EB` |
| 弱文字 | `#D1D5DB` |
| 提示文字 | `#9CA3AF` |
| 边框 | `#374151 / #4B5563` |
| 危险背景 | `rgba(239,68,68,0.12)`，描边 `rgba(239,68,68,0.3)` |
| 警告背景 | `rgba(245,158,11,0.12)` |
| 信息背景 | `rgba(59,130,246,0.12)` |
| Toast 错误 | `rgba(127,29,29,0.92)` + 红色描边 |
| Toast 警告 | `rgba(120,53,15,0.92)` + 黄色描边 |
| Toast 信息 | `rgba(30,58,138,0.92)` + 蓝色描边 |
| 阴影透明度 | 加重到 `0.5` |

### 1.2 字体

| 用途 | 字号/字重 | 备注 |
| --- | --- | --- |
| 站点名称/仪表盘标题 | `text-xl sm:text-2xl font-bold` | 颜色 `text-blue-400` / `text-blue-600` |
| 页面大标题 | `text-2xl font-bold` | 卡片内标题 `filter-title` |
| 文章卡片标题 | `text-lg font-bold` | `line-clamp-1` |
| 文章详情 H1 | `text-4xl md:text-5xl font-bold` | 白字，封面图上 |
| 侧栏标题 | `text-lg font-bold` | `text-gray-900` |
| 表单标题 | `text-3xl font-extrabold` | 登录页主标题 |
| 区块标题（卡片） | `text-xl font-semibold` | 后台 DataTable 等 |
| 子区块标题 | `text-lg font-semibold` | 通知标题等 |
| 正文摘要 | `text-sm leading-relaxed` | `text-gray-500` |
| Meta 信息 | `text-xs` | `text-gray-400 / 500` |
| 标签徽章 | `text-xs` | `text-gray-800` |
| 按钮 | `text-sm font-medium` | 主按钮白字 |
| 徽章数字 | `text-xs font-medium` | 数量徽章 |
| 提示文字 | `text-xs` | 辅助说明 |

### 1.3 间距/圆角/阴影/边框

| 元素 | 规范 |
| --- | --- |
| 卡片圆角 | `rounded-lg`（8px） / 播放器等用 `rounded-xl`（12px） |
| 输入框/按钮 | `rounded-md`（6px） |
| 标签徽章 | `rounded`（4px） / 标签 `rounded-full` |
| 头像/圆形按钮 | `rounded-full` |
| 卡片阴影 | `shadow-sm / shadow-md` / `hover:shadow-lg` |
| 弹窗阴影 | `shadow-xl` |
| 卡片间距 | `gap-4`（卡片网格） / `gap-6`（主区） |
| 主区容器 | `px-4 py-8` 或 `p-6` |
| 卡片内边距 | `p-4 / p-5 / p-6` |
| 主区域最大宽度 | `max-w-[1240px]`（项目约定） |
| Dashboard 主区 | `p-6` |
| 表单输入框 | `py-2 px-3` |
| 区块分隔 | `border-b border-gray-200` / `divide-y divide-gray-200` |

### 1.4 动效时长与曲线

| 场景 | 时长 | 曲线 |
| --- | --- | --- |
| 链接/按钮 hover | `150ms` | `ease` |
| 卡片 hover 阴影 | `200ms` | `ease` |
| 下拉菜单出现 | `200ms` | `ease` |
| 移动菜单展开 | `300ms` | `ease-in-out` |
| 侧栏滑入 | `300ms` | `ease-in-out` |
| 主题切换涟漪 | `500ms` | `ease-out` |
| 上传进度面板滑入 | `300ms` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Toast 出现/消失 | `300ms` | `ease` |
| 弹窗淡入 | `250ms` | `ease-in-out` |
| 图片缩放（hover） | `300ms` | `ease` |
| 标签页切换 | `200ms` | `ease` |
| 输入框聚焦 | `200ms` | `ease` |

### 1.5 透明度与玻璃态

| 场景 | 实现 |
| --- | --- |
| 顶部搜索弹窗 | `bg-white/90 backdrop-blur-md` |
| 音乐播放器 | `rgba(255,255,255,0.85) backdrop-blur(20px)` |
| 公告/弹窗遮罩 | `backdrop-blur-sm bg-black/20 ~ bg-opacity-30` |
| Lightbox | `bg-black/30 backdrop-blur-lg z-[9999]` |
| Toast | `backdrop-filter: blur(6px)` |
| 暗色模式遮罩 | `rgba(0,0,0,0.55)` |

### 1.6 渐变色与背景

| 用途 | 实现 |
| --- | --- |
| 文章封面渐变 | `bg-gradient-to-b from-black/30 to-black/70` |
| 音乐进度条 | `linear-gradient(90deg, #3b82f6, #60a5fa)` |
| 顶栏 gradient | 仪表盘标题区背景 `linear-gradient(to right, #1f2937, #111827)` |
| 暗色模式封面 | `rgba(0,0,0,0.55)` + 半透蒙层 |

---

## 2. 全局布局

### 2.1 页面骨架（前台）

```
┌─────────────────────────────────────────────┐
│  Header（fixed，64px 高）                    │ ← z-50
├─────────────────────────────────────────────┤
│  <div class="grow" style={{paddingTop:64}}>│
│  Hero 区（首页独有，可选）                    │
│  <main class="max-w-[1240px] mx-auto px-4 py-8">│
│   ┌─────────────────────┐ ┌────────────┐    │
│   │  内容主区（flex-1）  │ │  侧栏 310  │    │
│   │                     │ │  top-28    │    │
│   │                     │ │  sticky    │
│   └─────────────────────┘ └────────────┘    │
│  </main>                                    │
│  </div>                                     │
├─────────────────────────────────────────────┤
│  Footer                                     │
└─────────────────────────────────────────────┘
```

- **Header 固定**：`fixed top-0 left-0 right-0 z-50`，高度 `64px`。
- **主区域**：`<div className="grow">` 占满剩余高度。
- **侧栏**：宽度 `310px`，`sticky top-28`。
- **移动端**：折叠为单列，侧栏置于主区之下。

### 2.2 页面骨架（后台 Dashboard）

```
┌─────────────────────────────────────────────┐
│  DashboardHeader（h-16，shadow-sm）           │
├────────┬────────────────────────────────────┤
│Sidebar │  <main class="flex-1 overflow-y-auto p-6">│
│(w-64)  │  统计卡片（4 列网格）                │
│        │  快捷操作（3 列网格）                │
│ 菜单    │  通知区（标签 + 列表 + 无限滚动）   │
│ (sticky)│  …                                │
│        │                                    │
├────────┴────────────────────────────────────┤
│  底部用户信息（Sidebar 内 mt-auto）          │
└─────────────────────────────────────────────┘
```

- **后台容器**：`min-h-screen bg-gray-50`，`flex h-screen`。
- **侧栏**：固定/相对（`fixed md:relative`），可收起为 `w-16`。
- **主区域**：`flex-1 flex flex-col overflow-hidden w-full md:w-auto`。

---

## 3. 路由结构

| 路径 | 页面 | 备注 |
| --- | --- | --- |
| `/` | 首页 | Hero + 列表 + 侧栏 |
| `/?category=xxx` | 分类筛选 | URL 同步 |
| `/tag/:tagName` | 标签筛选 | |
| `/article/:articleId` | 文章详情 | 三栏布局 |
| `/login` | 登录 | |
| `/register` | 注册 | |
| `/forgot-password` | 找回密码 | |
| `/dashboard` | 仪表盘首页 | |
| `/dashboard/articles` | 文章管理 | |
| `/dashboard/articles/new` | 新建文章 | |
| `/dashboard/articles/:id` | 编辑文章 | |
| `/dashboard/profile` | 个人资料 | |
| `/dashboard/comments` | 我的评论 | |
| `/dashboard/comments-review` | 评论审核 | |
| `/dashboard/articles-review` | 文章审核 | |
| `/dashboard/menus` | 菜单管理 | |
| `/dashboard/users` | 用户管理 | |
| `/dashboard/settings` | 站点设置 | |
| `/dashboard/tags` | 标签管理 | |
| `/dashboard/categories` | 分类管理 | |
| `/dashboard/themes` | 主题商店 | |
| `/dashboard/friend-links` | 友情链接管理 | |
| `/dashboard/update` | 更新管理 | |
| `/dashboard/custom-pages` | 自定义页面 | |
| `/dashboard/announcement` | 公告管理 | |
| `/dashboard/global-attachments` | 全局附件 | |
| `/dashboard/my-attachments` | 我的附件 | |
| `/dashboard/rbac-editor` | 角色权限管理 | |
| `/friend-links` | 友情链接页 | 前台 |
| `/custom-page/:alias` | 自定义 HTML 页 | 前台 |
| `*` | 404 | |

---

## 4. 前台门户组件

### 4.1 Header 顶部导航

**结构**：

```
[站点名 blue-400 bold] [── 菜单居中 flex-1 ──] [🔍 搜索] [🌓 主题切换] [☰ 移动菜单] [👤 用户]
```

**容器**：
```jsx
<header className="bg-white shadow border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
  <div className="container mx-auto px-4 h-full">
    <div className="flex justify-between items-center h-full relative z-50">
```

**站点名**：
- `text-xl sm:text-2xl font-bold text-blue-400 truncate max-w-[200px] sm:max-w-none`
- 点击 `window.location.href = '/'`

**菜单区**：
- `hidden md:flex flex-1 min-w-0 items-center justify-center mx-6`
- 菜单项：`text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200`
- 间距：`space-x-8`（32px）

**菜单溢出策略（重点）**：

- 用「不可见测量副本」+ `ResizeObserver` 测量所有菜单项宽度。
- 计算容器宽度能容纳的菜单项数 `visibleCount`。
- 溢出项归入「更多 ▾」下拉：

```
<button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 font-medium">
  <span>更多</span>
  <svg className={`h-4 w-4 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
</button>
<div className={`absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden border border-gray-200 z-50
  ${isMoreMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
```

- 容器：测量 `<ul>` 用 `aria-hidden="true"` 离屏，`absolute -left-[9999px] top-0`。
- 「更多」按钮固定占位 `88px`。

**登录态菜单**：

- 已登录：头像（`w-8 h-8 rounded-full`） + 用户名（`max-w-[120px] truncate`）+ 下拉。
- 下拉：`absolute right-0 mt-2 w-48` + 阴影 + 边框。
- 项：「进入控制台」「登出」（登出项加 `border-t border-gray-100` 区分）。
- 未登录：胶囊按钮 `header-login-btn`：
  ```
  rounded-full bg-gray-100 hover:bg-blue-50
  text-gray-600 hover:text-blue-600
  px-3 py-1.5 text-sm font-medium
  inline-flex items-center gap-1.5
  transition-all duration-200
  ```

**移动端（< md 768px）**：

- 汉堡按钮：`md:hidden`，右对齐，`p-2 rounded hover:bg-gray-100`。
- 点击展开（旋转 90° 切换图标）：
  ```
  <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out
    absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200
    ${isMobileMenuOpen ? 'max-h-[80vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
    style={{ zIndex: 40 }}>
  ```
- 菜单项：`block w-full text-left py-3 px-2 hover:bg-blue-50 rounded-lg mobile-menu-link`。
- 登录按钮（移动）：`w-full py-3 bg-blue-400 hover:bg-blue-500 text-white`。
- 登出按钮：`text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg mobile-menu-link-logout`。
- 背景遮罩：`fixed inset-0 bg-black/20 backdrop-blur-sm`，点击关闭。

**外部交互关闭**：
```js
useEffect(() => {
  const handler = (e) => {
    if (isMobileMenuOpen && !e.target.closest('header')) setIsMobileMenuOpen(false);
    if (isUserMenuOpen && !e.target.closest('.user-menu-container')) setIsUserMenuOpen(false);
    if (isMoreMenuOpen && !e.target.closest('.more-menu-container')) setIsMoreMenuOpen(false);
  };
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
}, [isMobileMenuOpen, isUserMenuOpen, isMoreMenuOpen]);
```

### 4.2 Hero 头图

**结构**：
```jsx
<div className="relative bg-gray-900">
  <div className="absolute inset-0">
    <img className="w-full h-full object-cover" />
  </div>
  <div className="relative container mx-auto px-4 py-24 md:py-32">
    <div className="max-w-2xl">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
      {subtitle && <p className="text-xl text-gray-200 mb-8">{subtitle}</p>}
    </div>
  </div>
</div>
```

**规范**：

- 全屏宽背景图，`bg-gray-900` 兜底。
- 文字最大宽度 `max-w-2xl`，垂直内边距 `py-24 md:py-32`。
- 加载态：`absolute inset-0 bg-gray-300 animate-pulse` + 内部骨架 `h-12 bg-gray-200 rounded w-3/4 mb-4 animate-pulse`。
- 失败态：暗色背景 `bg-gray-800` + 「欢迎来到站点」标题 `text-4xl md:text-5xl font-bold text-white`。
- 图片 `onError` 回退 `/image_error.svg`。

### 4.3 ArticleCard 文章卡片

#### 桌面版（`md` 及以上，3 列网格）

```
┌───────────────────────────┐
│  [封面图 16:9 h-40]       │ ← group-hover:scale-105
├───────────────────────────┤
│  标题 (line-clamp-1)       │
│  摘要 (line-clamp-2)       │
│  [分类 chip] [标签1] [标签2]│
│  ────────────────────     │
│  [头像] 作者 · 日期        │
└───────────────────────────┘
```

- 容器：`article-card bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 cursor-pointer`
- 封面：`h-40 overflow-hidden`，图片 `rounded-t-lg group-hover:scale-105 transition-transform duration-300`
- 标题：`text-lg font-bold text-gray-900 line-clamp-1`，最大 30 字符截断 `safeTruncate(title, 30)`
- 摘要：`text-gray-500 text-sm line-clamp-2 leading-relaxed`
- 标签：`article-tag bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded hover:bg-gray-200 transition-colors shrink-0`
- 头像：`w-7 h-7 rounded-full object-cover`
- 整卡片可点击；标签/分类 `e.preventDefault() + e.stopPropagation()` 阻止冒泡。

#### 移动版（`forceMobile`，高度 `h-40` 横排）

```
┌──────────────────────────────────────────┐
│ [缩略图 1/3] 标题 (line-clamp-1)         │
│   w-40     │ 摘要 (line-clamp-3)         │
│   h-40     │ [分类] [标签] [标签]         │
│            │ [头像] 作者 · 日期           │
└──────────────────────────────────────────┘
```

- 高度固定 `h-40`，缩略图占 1/3 宽度 + `m-2` 边距。
- 标签行横向滚动：`flex items-center gap-1.5 overflow-x-auto tags-scroll`，隐藏滚动条。
- 头像 `w-5 h-5`，标题 `text-sm`。

**暗色模式**：
- 卡片：`bg-gray-800 border-gray-700`；标题 `#F9FAFB`；摘要 `#D1D5DB`；分类 `#1E3A8A / #93C5FD`。

### 4.4 ArticleList 文章列表

**顶部工具栏**：
```
┌──────────────────────────────────────────────────┐
│  [筛选标题 text-2xl font-bold]  [图片开关] [清除筛选] │
└──────────────────────────────────────────────────┘
```

- 标题：`text-2xl font-bold text-gray-900 filter-title`
- 图片开关（仅 `md` 及以上可见）—— 自定义 Switch：
  ```
  <div className="relative">
    <input type="checkbox" className="sr-only" checked={showImages} readOnly />
    <div className={`
      w-11 h-6 rounded-full transition-all duration-300 border
      ${showImages ? 'bg-blue-500 border-blue-600' : 'bg-gray-200 border-gray-300 dark-switch-bg'}
    `} />
    <div className={`
      absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300
      ${showImages ? 'translate-x-5' : 'translate-x-0'}
    `} />
  </div>
  ```
- 文字：`mr-3 text-sm font-medium text-gray-600 switch-label select-none`
- 清除筛选：`text-sm text-blue-600 hover:text-blue-800` —— 出现条件：`categoryName || tagName`

**网格**：
```
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
```

**加载态**：
```
<div className="flex items-center justify-center text-gray-500"
     style={{ minHeight: holdHeight ?? 600 }}>
  加载中...
</div>
```
> `holdHeight` 在切换前记录旧高度，避免布局抖动。

**空态**：`text-center py-12 text-gray-500` + 「暂无文章」

**分页器**：
```
[上一页] [1 / 5] [下一页]
```
- 按钮：`px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50 pagination-button`
- 中间信息：`pagination-info`：`px-4 py-2 mx-1 pagination-info text-gray-600`，暗色 `bg-gray-700 border-gray-600`
- 切换不滚动到顶部（保留上下文）。

**Abort 策略**：
```js
const abortController = new AbortController();
await apiClient.get(url, { signal: abortController.signal });
// 切换条件时 abort 上一次
```

### 4.5 侧栏三件套

#### 4.5.1 统一外壳

```
┌──────────────────────────┐
│  [图标] 标题              │
│  ─────────                │
│  列表/内容                │
│  [▼ 渐隐遮罩]            │
└──────────────────────────┘
```

- 容器：`bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-200`
- 标题：`text-lg font-bold text-gray-900 mb-4`

#### 4.5.2 CategorySidebar（文章分类）

- 列表项：`flex justify-between items-center w-full text-left px-2 py-1 rounded`
- 选中态：`bg-blue-100 text-blue-800`
- 未选中：`text-gray-600 hover:bg-gray-50`
- 数量徽章：`bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full`
- 滚动容器：`max-h-60 overflow-y-auto pr-2`，隐藏滚动条（`.hide-scrollbar`）。

**渐隐遮罩（细节）**：
```jsx
<div className="relative">
  <div className="category-fade-mask-top absolute top-0 left-0 right-0 h-10 pointer-events-none z-10"
       style={{ opacity: showTopGradient ? 1 : 0 }} />
  <ul ref={listRef} className="hide-scrollbar space-y-2 max-h-60 overflow-y-auto pr-2">
    ...
  </ul>
  <div className="category-fade-mask-bottom absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
       style={{ opacity: showBottomGradient ? 1 : 0 }} />
</div>
```
- 顶部渐变 `linear-gradient(to top, transparent, #ffffff)`，底部反之。
- 监听 `scroll` + `ResizeObserver` 动态切换 opacity。
- 暗色模式遮罩变为 `transparent → #1F2937`。

#### 4.5.3 TagSidebar（文章标签）

- 布局：`flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2`。
- 徽章：`px-3 py-1 text-sm rounded-full`
- 选中：`bg-blue-500 text-white`
- 未选中：`bg-gray-100 text-gray-800 hover:bg-gray-200`

#### 4.5.4 RecommendedArticles（热门文章）

- 容器：`rounded-xl shadow-sm p-5`（圆角更柔）
- 列表项：`block w-full text-left p-3 rounded-lg hover:bg-gray-50`
- 标题：`font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 break-words`
- Meta 行：
  - 日期 `whitespace-nowrap truncate`
  - 分隔符 `•`
  - 作者 `truncate min-w-0`
  - 眼睛图标 + 浏览量（`1.2k` 简写函数 `formatViews`）
- 同样使用渐隐遮罩。

### 4.6 ArticleReader 文章详情

**布局（桌面 `lg` 及以上，三栏）**：
```
┌─────────────────────────────────────────────────────┐
│  [封面图 h-96，渐变蒙层 to-black/70]                  │
├──────────┬─────────────────────────────┬────────────┤
│ 目录 TOC  │      文章正文（卡片）       │  分类      │
│ (sticky)  │      [评论]                │  标签      │
│           │                             │  热门      │
└──────────┴─────────────────────────────┴────────────┘
```

- 卡片「浮」在封面上方：`"-mt-20 relative z-10"`
- 左：`hidden lg:block lg:w-1/4`
- 中：`w-full lg:w-1/2`
- 右：`hidden lg:block lg:w-1/4`，`sticky top-28`

**封面**：
- 全宽 `h-96`，`object-cover`，渐变 `bg-gradient-to-b from-black/30 to-black/70`。

**TableOfContents**：
- 容器：`bg-white rounded-lg shadow-md p-5`
- 标题按钮 + 折叠列表（`translate-y` 平滑过渡）
- 缩进根据 `h2/h3/h4` 级别
- 激活项 `bg-blue-50 text-blue-600`
- 滚动时联动 IntersectionObserver 高亮

**密码保护**：
- 中央卡片 `max-w-md mx-auto mt-10`，`bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4`
- 标签：`block text-gray-700 text-sm font-bold mb-2`
- 输入：`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700`
- 按钮：`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`

**回到顶部**：
- 滚动 `> 300px` 后右下角显示圆形按钮
- `fixed bottom-8 right-8 bg-white hover:bg-gray-100 text-black rounded-full p-3 shadow-lg transition-all duration-300 z-50`
- 平滑滚动 `behavior: 'smooth'`
- 暗色 `bg-gray-800 text-white`

### 4.7 CommentSection 评论区

**结构**：
```
┌─────────────────────────────────────┐
│  评论                                │
├─────────────────────────────────────┤
│  [textarea 4 行：写下你的评论...]      │
│  [清空] [发表]                        │
│  Enter发送，Shift+Enter换行           │
├─────────────────────────────────────┤
│  评论项：                              │
│  [头像 w-10] 用户名 • 时间            │
│  内容 (whitespace-pre-wrap)           │
│  👍 12   回复   删除                  │
│                                     │
│     └─ [头像 w-8] 用户名              │
│         回复 @父级 • 时间             │
│         内容                          │
│         👍 12  回复  删除             │
└─────────────────────────────────────┘
```

- 容器：`mt-10 bg-white rounded-lg shadow p-6`
- 输入框：`border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500`
- 操作按钮组：`absolute bottom-3 right-3 flex space-x-2`
- 评论项：`border-b border-gray-200 py-4`
- 头像：顶级 `w-10 h-10`，嵌套 `w-8 h-8`，`rounded-full object-cover`
- 嵌套缩进：`ml-8 mt-3`
- 点赞按钮：激活 `text-red-500`，未激活 `text-gray-500 hover:text-red-500`
- 文本溢出：`break-words whitespace-pre-wrap overflow-hidden`
- 时间显示函数：`formatTime`：
  - `< 60s` → 刚刚
  - `< 3600s` → X 分钟前
  - `< 86400s` → X 小时前
  - 否则 → X 天前
- 键盘：`Enter` 发送，`Shift+Enter` 换行。

### 4.8 Search 搜索

**触发**：Header 右侧放大镜按钮。

**弹出层（桌面）**：
- `absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)]`
- 容器：`bg-white/90 backdrop-blur-md shadow-xl rounded-xl z-50 border border-gray-200`

**弹出层（移动）**：
- `fixed right-4 left-4 top-20 w-auto max-w-none`
- `max-h-[60vh]`

**输入框**：
- `px-5 py-3 pl-12 rounded-xl border bg-white/80 focus:ring-2 focus:ring-blue-500`
- 左侧搜索图标内嵌（`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`）
- 自动聚焦：弹层打开后 100ms。

**结果列表**：
- 项：`block p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100`
- 标题 `line-clamp-1`，摘要 `line-clamp-2 text-xs`
- 滚动容器：`mt-3 max-h-96 overflow-y-auto space-y-1`

**加载**：
- `animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500` + 「搜索中...」文字

**空结果**：居中 + 表情图标 + 「未找到相关文章」

**遮罩**：`fixed inset-0 bg-black/20 z-40 backdrop-blur-sm`

**防抖**：`debounce 300ms` 触发接口

### 4.9 ThemeToggle 主题切换

**按钮**：
- `p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200`
- 太阳/月亮 SVG，`h-6 w-6`，`strokeWidth={2}`
- 持久化：localStorage `theme = 'dark' | 'light'`

**涟漪动画（View Transitions API）**：

1. 计算按钮中心 `(x, y)`，计算到屏幕最远角的最大半径 `maxRadius`。
2. 注入 CSS 自定义属性：
   ```js
   document.documentElement.style.setProperty('--ripple-x', `${x}px`);
   document.documentElement.style.setProperty('--ripple-y', `${y}px`);
   document.documentElement.style.setProperty('--ripple-r', `${maxRadius}px`);
   ```
3. 调用 `document.startViewTransition(applyTheme)`：
   ```css
   ::view-transition-old(root),
   ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
   ::view-transition-new(root) {
     clip-path: circle(0px at var(--ripple-x) var(--ripple-y));
     animation: theme-ripple 0.5s ease-out forwards;
   }
   @keyframes theme-ripple {
     to { clip-path: circle(var(--ripple-r) at var(--ripple-x) var(--ripple-y)); }
   }
   ```
4. **降级**：无 `startViewTransition` 时直接切换 `.dark`。

### 4.10 Login / Register / ForgotPassword 表单

**结构**：
```
[圆形图标 h-12 w-12 bg-blue-400] (Login)
[大标题 text-3xl font-extrabold]
[副标题]
[错误条]
[输入框块 × N]
[验证码：输入 + 图片 h-10 w-24]
[主按钮 w-full]
[副链接：注册 • 忘记密码？]
```

**容器**：
- 居中布局：`flex items-center justify-center py-12 px-4`，`paddingTop: 64` 避让 Header
- 卡片：`max-w-md w-full space-y-8`，内含图标 + 表单卡 `bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10`

**图标头**：
- `mx-auto h-12 w-12 rounded-full bg-blue-400 flex items-center justify-center`
- 内嵌 SVG `h-6 w-6 text-white`

**标题**：`mt-6 text-center text-3xl font-extrabold text-gray-900`

**错误条**：
- `mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm`
- **5 秒后自动消失**（setTimeout clearError）
- 暗色 `bg-red-900/12 text-red-300`

**输入框**：
- `appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm`
- `placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`
- 暗色 `bg-gray-700 border-gray-600 text-white placeholder-gray-500`

**验证码块**：
- `flex space-x-2`，左侧输入 `flex-1`，右侧图片 `h-10 w-24 border rounded cursor-pointer`
- 点击图片触发 `fetchCaptcha()`

**主按钮**：
- `w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50`
- 加载中按钮内嵌旋转 SVG：
  ```jsx
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="..." />
  </svg>
  ```

**副链接**：
- `mt-2 text-center text-sm text-gray-600`
- 「注册」+「忘记密码?」：`font-medium text-blue-600 hover:text-blue-500 ml-1`

### 4.11 FriendLinks 友情链接

- 页面布局同后台表单，最大宽度居中卡片。
- 分类（友人/站点）+ 描述 + 头像 + 链接。
- 卡片网格 + hover 阴影 + 跳转外部。

### 4.12 Footer

**结构**：
```jsx
<footer className="bg-white mt-auto">
  <div className="container mx-auto px-4 py-8">
    <div className="text-center text-gray-600">
      <p>{copyright}</p>
      {icpRecord && <p className="mt-2">...</p>}
      {mpsRecord && <p className="mt-1">...</p>}
      {footerCode && <ScriptAwareHtml html={footerCode} />}
    </div>
  </div>
</footer>
```

**规范**：
- `bg-white`，顶部留出 `mt-auto`。
- 版权信息居中 `text-gray-600`。
- ICP 备案链接：`text-gray-600 hover:text-blue-600 text-sm`，指向 `https://beian.miit.gov.cn`。
- 公安备案链接：指向 `http://www.beian.gov.cn`。
- 自定义 footer HTML 通过 `ScriptAwareHtml` 安全渲染（DOMPurify）。

### 4.13 PageNotFound

- 居中布局 + 大号 404 + 「返回首页」按钮。
- 按钮 `bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md`。

---

## 5. 后台 Dashboard 模块

### 5.1 Dashboard 总体布局

**容器**：
```jsx
<div className="min-h-screen bg-gray-50 transition-colors duration-200">
  <div className="flex h-screen relative">
    <Sidebar ... />
    <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
      <DashboardHeader ... />
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && <DashboardView />}
        ...
      </main>
    </div>
  </div>
</div>
```

**Suspense + FadeIn 过渡**：
- 每个视图都 `lazy(() => import(...))` 加载。
- 包裹 `<FadeIn duration={200}>` 实现 `opacity 0 → 1` 淡入。

**自动检查更新**：登录后自动 `GET /update/check`，新版本 toast 提示。
- 兼容：`info`，5000ms
- 不兼容：`warning`，5000ms

### 5.2 Sidebar 侧边栏

**布局**：
```jsx
<div className={`
  group
  ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  w-64 md:w-auto
  ${!isOpen && 'md:w-16'}
  bg-white border-r border-gray-200
  flex flex-col
  fixed md:relative h-full z-50
  transition-all duration-300 ease-in-out sidebar-bg
`}>
```

**尺寸变化**：
- 展开：`w-64`（256px）
- 收起：`w-16`（64px，仅图标）
- 移动端：从 `-translate-x-full` → `translate-x-0`

**折叠按钮（hover 才显示）**：
```jsx
<button className="hidden md:flex items-center justify-center absolute top-20 -right-3 h-6 w-6
  rounded-full bg-white border border-gray-200 shadow-md text-gray-500
  hover:text-blue-600 hover:border-blue-300 hover:shadow-lg
  opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 sidebar-toggle-btn"
  title={isOpen ? '收起侧边栏' : '展开侧边栏'}>
```

**顶部站点名**：
```jsx
<div className="h-16 px-4 flex items-center border-b border-gray-200 sidebar-header-border">
  <div className="text-2xl font-bold text-blue-600 sidebar-site-name cursor-pointer hover:opacity-80">
    {isOpen ? siteName : (siteName?.charAt(0) || 'D')}
  </div>
</div>
```

**菜单区**：
- `mt-4 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar`
- 列表容器：`space-y-1 px-2`

**菜单项（一级）**：
```jsx
<button className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
  ${active
    ? 'bg-blue-100 text-blue-700 sidebar-nav-item-active'
    : 'text-gray-700 hover:bg-gray-100 sidebar-nav-item-default'}`}>
  <span className="text-lg">{getIcon(item.icon)}</span>
  {isOpen && (
    <>
      <span className="ml-3">{item.title}</span>
      <svg className={`ml-auto h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </>
  )}
</button>
```

**子菜单**：
- `mt-1 space-y-1`
- 子项：`px-3 py-2 ml-6`，图标 `text-base`
- 收起时不展开子菜单（点击父级自动展开）

**底部用户信息**：
- `mt-auto p-4 border-t border-gray-200 sidebar-user-info-border`
- 头像 `w-8 h-8 rounded-full`
- 用户名：`text-sm font-medium text-gray-900 truncate`
- 设置图标按钮：`text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100`

**移动端遮罩**：
```jsx
<div className="fixed inset-0 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
     style={{ backdropFilter: isOpen ? 'blur(4px)' : 'blur(0px)' }}
     onClick={onClose} />
```

**暗色模式**：
- `sidebar-bg: #1F2937`
- `sidebar-nav-item-active: bg-blue-800 text-blue-200`
- `sidebar-user-name: #F3F4F6`

### 5.3 DashboardHeader 顶部条

**结构**：
```jsx
<header className="bg-white shadow-sm border-b border-gray-200">
  <div className="px-4 h-16 flex items-center justify-between">
    <div className="flex items-center">
      <button className="md:hidden ... h-9 w-9 mr-3 rounded-lg border">
        {/* 汉堡 */}
      </button>
      <h1 className="text-xl font-bold text-blue-600">仪表板</h1>
    </div>
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      <div className="relative">
        <button className="flex items-center space-x-2 ...">
          <div className="w-8 h-8 rounded-full">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full" />
          </div>
          <span className="font-medium text-sm sm:text-base">{username}</span>
          <svg className="h-5 w-5"><path .../></svg>
        </button>
        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
            <button onClick={...}>返回网站</button>
            <hr className="border-gray-200 my-1" />
            <button className="text-red-600 hover:bg-gray-100" onClick={onLogout}>登出</button>
          </div>
        )}
      </div>
    </div>
  </div>
</header>
```

**规范**：
- 高度 `h-16`，`shadow-sm`（比前台 Header 弱），底部边框。
- 汉堡按钮：`md:hidden inline-flex items-center justify-center h-9 w-9 mr-3 rounded-lg border`，`active:scale-95` 按下反馈。
- 标题：`text-xl font-bold text-blue-600`（按 tab 动态变化）。
- 用户菜单下拉：`w-48`，「返回网站」+「登出」分隔。

### 5.4 DashboardView 仪表盘首页

**结构**：
```
┌── 统计卡片（4 列 grid） ────────────────┐
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │总文章数│ │总用户数│ │总评论数│ │总访问量│   │
│ └──────┘ └──────┘ └──────┘ └──────┘    │
└────────────────────────────────────────┘

┌── 快捷操作（3 列 grid） ─────────────────┐
│ 卡片：图标 + 标题 + 描述 + →             │
└────────────────────────────────────────┘

┌── 通知 ────────────────────────────────┐
│ [通知标题]            [全部] [未读] [已读]│
│ ┌──────────────────────────────┐       │
│ │ 未读高亮蓝 / 已读白           │       │
│ │ [标为已读] [删除]              │       │
│ └──────────────────────────────┘       │
│ ... 无限滚动 IntersectionObserver       │
└────────────────────────────────────────┘
```

#### 5.4.1 统计卡片

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map(stat => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <span className="text-blue-600 text-lg">{getIcon(stat.icon)}</span>
        </div>
      </div>
    </div>
  ))}
</div>
```

- 卡片：`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md`
- 图标块：`p-3 bg-blue-50 rounded-lg`
- 数字：`text-2xl font-bold text-gray-900 mt-1`
- 标签：`text-sm font-medium text-gray-500`

#### 5.4.2 快捷操作

```jsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {quickActions.map(action => (
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <span className="text-blue-600 text-lg">{getIcon(action.icon)}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{action.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{action.description}</p>
          </div>
          <svg className="h-5 w-5 text-gray-400">...→</svg>
        </div>
      </div>
    ))}
  </div>
</div>
```

- 卡片：`border border-gray-200 rounded-lg p-4 hover:bg-gray-50`
- 右侧箭头 `text-gray-400`，hover 时变 `text-blue-500`（可选）。

#### 5.4.3 通知面板

- 容器：`notification-container bg-white rounded-lg shadow-sm border border-gray-200 p-6`
- 标题行：`flex items-center justify-between mb-4`
- 标签切换：
  ```
  <button className={`px-3 py-1 text-sm rounded transition-colors duration-200
    ${active ? 'notification-tab-active bg-blue-500 text-white'
            : 'notification-tab bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
  ```
- 列表项：
  ```
  <div className={`notification-item border border-gray-200 rounded-lg p-4
    ${notification.read ? 'notification-item-read bg-white hover:bg-gray-50'
                        : 'notification-item-unread bg-blue-50 hover:bg-blue-100'}`}>
  ```
- 操作：`notification-btn-read text-xs text-blue-600 hover:text-blue-800` + `notification-btn-delete text-xs text-red-600`
- 滚动列表：`h-96 overflow-y-auto pr-2`，`scrollbar-width: thin`
- **无限滚动**：使用 `IntersectionObserver` 监听列表底部哨兵元素，触发 `loadNotifications(nextPage, true)`。
- 加载中/无更多状态：底部 `text-center py-4 text-sm`。

### 5.5 DataTable 数据表格

**结构**：
```
┌──────────────────────────────────────────┐
│  [标题]                  [headerActions]  │
│  [headerExtra 可选]                       │
│  [搜索框] [清除]（可选）                   │
│  ┌──────────────────────────────────┐    │
│  │ 表头                                │    │
│  │ 表格行                              │    │
│  └──────────────────────────────────┘    │
│  [Pagination]                             │
└──────────────────────────────────────────┘
```

**容器**：`bg-white rounded-lg shadow-sm p-6`

**标题区**：
```jsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    {headerExtra}
  </div>
  {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
</div>
```

**搜索框**：
```jsx
<div className="mb-6">
  <div className="flex items-center gap-3">
    <div className="relative flex-1 max-w-md">
      <input type="text" placeholder={searchPlaceholder}
             className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 text-sm" />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
    {searchValue && <button className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 ...">清除</button>}
  </div>
</div>
```

**错误条**：
```jsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
    <p className="text-red-700">{error}</p>
  </div>
)}
```

**表格**：
```jsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>{columns.map(col => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.label}</th>)}</tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {data.map(item => (
        <tr className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}>
          {columns.map(col => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{col.render ? col.render(...) : cellValue}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

- 表头：`bg-gray-50`，`text-xs font-medium text-gray-500 uppercase tracking-wider`
- 行 hover：`hover:bg-gray-50`
- 单元格：`px-6 py-4 whitespace-nowrap text-sm`
- 支持 `columns[i].render(value, item, index)` 自定义渲染。
- 支持 `columns[i].headerClassName / className` 自定义样式。

**加载态**：
```jsx
<div className="flex justify-center items-center h-64">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
</div>
```

**空态**：`text-center py-12 text-gray-500` + `emptyText`。

### 5.6 Pagination 分页器

**容器**：`flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4`

**移动端**：
```jsx
<div className="flex flex-1 justify-between sm:hidden">
  <button>上一页</button>
  <button className="ml-3">下一页</button>
</div>
```

**桌面端**：
```jsx
<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
  <div>
    <p className="text-sm text-gray-700">
      显示第 <span className="font-medium">{(currentPage-1)*pageSize+1}</span> 到{' '}
      <span className="font-medium">{Math.min(currentPage*pageSize, totalItems)}</span> 条结果,
      共 <span className="font-medium">{totalItems}</span> 条
    </p>
  </div>
  <div className="flex items-center gap-4">
    {/* 分页按钮组 */}
    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
      <button className="rounded-l-md ...">«</button>
      <button>‹</button>
      {pageItems.map(page => (
        <button className={`px-4 py-2 text-sm font-semibold
          ${page === currentPage ? 'z-10 bg-blue-600 text-white'
            : page === '...' ? 'text-gray-700'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}>
          {page}
        </button>
      ))}
      <button>›</button>
      <button className="rounded-r-md ...">»</button>
    </nav>

    {/* 跳转 */}
    <form className="flex items-center gap-2">
      <span className="text-sm text-gray-700">跳转到</span>
      <input type="number" min="1" max={totalPages}
             className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
      <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">跳转</button>
    </form>
  </div>
</div>
```

**逻辑**：
- `delta = 2`：当前页前后显示 2 个数字页码。
- `pageItems = [1, ..., currentPage-delta ~ currentPage+delta, ..., totalPages]`，省略号自动插入。
- `if (totalPages <= 1) return null` —— 单页不渲染。

### 5.7 AvatarUpload 头像上传

**结构**：
```
┌─────────────┐
│  [头像预览]   │ ← w-32 h-32 rounded-full
│  上传中遮罩   │   border-2 border-gray-300
└─────────────┘
[选择头像 按钮]
[错误提示]
[格式说明：JPG/PNG/GIF/WebP ≤5MB]
```

**预览**：
```jsx
<div className="relative">
  <img src={preview || '/image_error.svg'} alt="头像预览"
       className="w-32 h-32 rounded-full object-cover border-2 border-gray-300" />
  {uploading && (
    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
    </div>
  )}
</div>
```

**按钮**：
```jsx
<label className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
  {uploading ? '上传中...' : '选择头像'}
  <input type="file" className="hidden" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
         onChange={handleChange} disabled={uploading} />
</label>
```

**校验**：
- 类型限制：JPG/JPEG/PNG/GIF/WebP
- 大小限制：5MB
- 错误：`text-red-600 text-sm`

**进度**：
- 通过 `uploadProgress.start/progress/processing/done/error` 联动全局进度面板。

### 5.8 AnnouncementManager 公告管理

**结构**：
```
┌── 头部 ─────────────────────────────┐
│ [公告管理]      [上传图片] [保存公告] │
├────────────────────────────────────┤
│  [编辑 50%]    │    [预览 50%]       │
│  <textarea>    │    <preview HTML>   │
└────────────────────────────────────┘
```

**头部**：
- `p-4 md:p-6 border-b border-gray-200`，`flex justify-between items-center`
- 标题：`text-xl font-semibold text-gray-900`
- 按钮：
  - 「上传图片」：`px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200`
  - 「保存公告」：`px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50`

**编辑器布局**：
```jsx
<div className="flex overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
  <div className="w-1/2 border-r border-gray-200 flex flex-col">
    <div className="px-4 py-2 bg-gray-50 border-b">
      <span className="text-xs font-medium text-gray-500">编辑</span>
    </div>
    <textarea ref={textareaRef} value={content} onChange={...}
              className="flex-1 w-full resize-none p-4 text-sm text-gray-900 border-0
                         focus:outline-none focus:ring-0 font-mono"
              placeholder="请输入公告内容..." />
  </div>
  <div className="w-1/2 flex flex-col">
    <div className="px-4 py-2 bg-gray-50 border-b">
      <span className="text-xs font-medium text-gray-500">预览</span>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
      <style>{`.preview-content img { max-width: 100%; height: auto; margin: 0.75em 0; border-radius: 4px; }`}</style>
      {content.trim()
        ? <div className="preview-content text-sm text-gray-900" dangerouslySetInnerHTML={{__html: sanitizedHtml}} />
        : <p className="text-sm text-gray-400">在左侧输入内容后，此处将显示预览效果</p>}
    </div>
  </div>
</div>
```

**安全**：`DOMPurify.sanitize(html, { ALLOWED_TAGS: ['img', 'br'], ALLOWED_ATTR: ['src', 'alt'] })`，换行 → `<br>`。

**图片插入**：上传后使用 `cursorPosRef` 在光标位置插入 `<img src="..." alt="" />` 标签。

### 5.9 MarkdownEditor 富文本编辑器

**整体结构**：
```
┌──────────────────────────────────────────────────────┐
│  [标题输入]                                          │
│  [保存] [关闭] [展开侧边信息]                          │
├──────────────────────────────────────────────────────┤
│  [MarkdownToolbar：13 个图标按钮]                     │
│  H1 H2 H3 粗体 斜体 链接 图片 视频 音频 压缩包 文档    │
│  列表 代码 AI生成 本地化外部资源                       │
├──────────────────────────┬───────────────────────────┤
│  [MarkdownTextarea 左]    │  [MarkdownPreview 右]      │
│  (等宽字体 monospace)     │  (渲染 HTML)               │
│                          │                            │
├──────────────────────────┴───────────────────────────┤
│  [ArticleInfoForm 抽屉]                              │
└──────────────────────────────────────────────────────┘
```

#### 5.9.1 顶部条

- 标题输入框：`text-2xl font-bold` 或 `border-b border-gray-200 py-3 px-4`。
- 工具按钮：`Save`（绿）、`X` 关闭、`FileText` 展开信息抽屉。
- 全屏 modal 形式（覆盖全屏）。

#### 5.9.2 MarkdownToolbar（13 个按钮）

| 按钮 | icon | 快捷键 | 行为 |
| --- | --- | --- | --- |
| Bold | `Bold` | Ctrl+B | 插入 `**...**` |
| Italic | `Italic` | Ctrl+I | 插入 `*...*` |
| Heading | `Heading` | — | 弹出 `# / ## / ### / ####` 菜单 |
| Link | `Link` | Ctrl+K | 插入 `[...](https://)` |
| Image | `Image` | — | 文件上传 |
| Video | `Video` | — | 文件上传 |
| Audio | `Music` | — | 文件上传 |
| Archive | `Archive` | — | 文件上传（.zip 等） |
| Document | `FileText` | — | 文件上传（PDF/Word） |
| List | `List` | — | 插入 `- 列表项` |
| Code | `Code` | Ctrl+E | 插入代码块 |
| AI Generate | `Sparkles` | — | 弹出 AI 生成对话框 |
| Localize | `Download` | — | 本地化外部资源 |

- 容器：`flex flex-wrap items-center justify-between border-b border-gray-200 bg-gray-50 px-2`
- 按钮：`p-2 sm:p-3 hover:bg-gray-100 rounded w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center toolbar-btn`
- 标题下拉菜单：`absolute top-full left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10`
- 选项：`# 一级标题 / ## 二级标题 / ### 三级标题 / #### 四级标题`，`block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm`
- 点击外部关闭：`mousedown` 事件 + `headingMenuRef.contains` 判断。

#### 5.9.3 编辑/预览布局

- 双列等宽 `w-1/2`
- 中间分隔：拖拽/固定
- **同步滚动开关**：`syncScrollEnabled`，开启后 `editorScrollRatio → previewScrollTop`，使用 `isSyncingScrollRef` 避免递归。
- 编辑器：`font-mono`，`border-0 focus:outline-none focus:ring-0`
- 预览：渲染 HTML（react-markdown + remark-gfm + rehype-raw + rehype-sanitize）

#### 5.9.4 历史记录（HistoryManager）

- 最多 100 步
- 任何 `content / title` 变更入栈（用 `isProcessingHistoryRef` 避免 undo/redo 重新入栈）
- `undo()` / `redo()` 通过 `Ctrl+Z` / `Ctrl+Shift+Z`（或 `Ctrl+Y`）
- 超出 maxHistory 自动丢弃最早。

#### 5.9.5 ArticleInfoForm（侧滑抽屉）

- 字段：分类、标签、封面、别名、密码、评论开关、置顶、是否发布等
- 表单字段使用统一的 input/select/textarea 样式（同 4.10 节）
- 「发布」按钮：`bg-blue-500 hover:bg-blue-600 text-white`，loading 状态。

#### 5.9.6 选区工具栏（TextSelectionToolbar）

- 当用户选中文字时浮出工具条
- 提供：加粗、斜体、链接、代码、AI 重写等
- 位置：根据 `getBoundingClientRect` 动态定位

#### 5.9.7 AI 生成对话框

- 弹出 modal，输入描述 → 「生成」
- 加载中按钮内嵌 spinner + 进度文字
- 完成后替换/追加到编辑器内容

#### 5.9.8 本地化外部资源

- 扫描内容中的外部图片/视频
- 进度：`localizingResources: Set` + `localizeProgress: {current, total}`
- 弹窗显示每个资源的状态（pending → processing → done/error）

### 5.10 CategoriesView / TagsView 分类与标签管理

#### 5.10.1 分类（CategoriesView，支持父子树）

**结构**：
```
[分类管理]            [+ 新建顶级分类]
─────────────────────────────
一级分类                            [启用/禁用 chip]
   描述                                  文章数: N  子分类: N
                                         [+ 子分类] [编辑] [禁用]
   └ 子分类                            [启用 chip]
       描述                              [+ 子分类] [编辑] [禁用]
```

- 行容器：`flex items-center justify-between py-3 px-4 bg-white border-b border-gray-200 hover:bg-gray-50`
- 子级缩进：`ml-8` + 装饰线条 `-ml-8 mr-2`
- 状态徽章：
  - 启用：`bg-green-100 text-green-800`
  - 禁用：`bg-red-100 text-red-800`
- 文字按钮：
  - 操作：`text-blue-600 hover:text-blue-900 text-sm`
  - 删除（禁用）：`text-red-600 hover:text-red-900 text-sm`
  - 激活（恢复）：`text-green-600 hover:text-green-900 text-sm`

**新增/编辑 Modal**：
- 标题：`编辑分类 / 创建子分类 / 新建顶级分类`
- 字段：
  - 父分类下拉（仅新建时显示）：`mt-1 block w-full border border-gray-300 rounded-md ...`
  - 分类名称（必填）：错误时 `border-red-300`
  - 分类说明（必填）：textarea 3 行
- 底部按钮区：`bg-gray-50 flex justify-end space-x-3`
  - 取消：白底边框 `bg-white border border-gray-300`
  - 保存：蓝底 `bg-blue-600 hover:bg-blue-700`
- 校验失败：字段下显示 `mt-1 text-sm text-red-600`

#### 5.10.2 标签（TagsView）

- 横向 chip 列表 + 行内编辑
- 支持批量导入、合并、统计文章数
- 同一 Modal 风格

### 5.11 UsersView 用户管理

- 基于 DataTable：
  - 列：头像/用户名/邮箱/角色/状态/注册时间/操作
  - 操作：编辑、禁用、删除、重置密码
- 顶部 `headerActions`：「+ 新建用户」按钮
- 弹窗：用户表单（用户名、邮箱、角色下拉、密码、头像）

### 5.12 SiteSettingsView 站点设置

**多区块表单**：

| 区块 | 字段 |
| --- | --- |
| 基本信息 | 站点名称、Logo、描述、关键词、ICP 备案、公安备案 |
| 主题外观 | 主色、强调色、自定义 CSS、head/footer code |
| 评论 | 全站开关、敏感词、审核 |
| SEO | sitemap、robots、动态 meta |
| 存储 | 默认存储、本地/WebDAV/S3 等多存储配置 |
| AI | 大模型审核/生成开关、模型选择、prompt 模板 |
| 用户 | 注册开关、邀请码、RBAC 默认角色 |

**输入组件规范**（统一）：
- Label：`block text-sm font-medium text-gray-700`
- Input：`mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`
- Textarea：同 input + `rows={3}`
- Select：同 input（`py-2 px-3 pr-8`）
- Toggle / Radio：参考前台 ArticleList 开关样式
- 提示文字：`mt-1 text-xs text-gray-500`

**危险操作**：红色 `bg-red-600 hover:bg-red-700`，需 `window.confirm` 二次确认。

### 5.13 UpdateManager 更新管理

**结构**：
```
[更新标题]
[状态条：当前版本/最新版本/兼容性]
[Badge 状态]
┌─────────────────────────────┐
│ [可更新卡片]                 │
│   标题                       │
│   版本/大小/发布时间          │
│   ⚠️ 不兼容提示（如适用）     │
│   [查看 Changelog] [一键更新] │
└─────────────────────────────┘
[Changelog 抽屉：左版本列表 + 右详情]
[底部通知列表]
```

**状态条**：
- 容器：`border border-gray-200 rounded-md` （或暗色 `bg-gray-800 border-gray-700`）
- 单元格分隔：`border-l border-gray-200`
- Label：`text-xs text-gray-500 update-status-label`
- Value：`text-sm font-medium text-gray-900 update-status-value`，高亮 `update-status-value-highlight`（蓝）

**Badge**：
| 状态 | 样式 |
| --- | --- |
| 默认 | `bg-gray-100 text-gray-800 border-gray-200` |
| 成功 | `bg-green-50 text-green-700 border-green-200` |
| 信息 | `bg-blue-50 text-blue-700 border-blue-200` |
| 警告 | `bg-orange-50 text-orange-700 border-orange-200` |

**Changelog 抽屉**：
- 左：`update-changelog-sidebar`（版本列表），激活项 `border-left: 2px solid #3b82f6`
- 右：详情（按类别分组的更新项列表 + `update-changelog-item-dot` 圆点）

**不兼容 banner**：`bg-orange-50 text-orange-800 border-orange-200`，含 ⚠ 图标。

### 5.14 AttachmentsManager 附件管理

**两张视图**：全局附件 + 我的附件。

**网格视图**：
- `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4`
- 卡片：缩略图 + 文件名 + 大小 + 操作（复制链接、删除、移动存储）
- 多选：右上角复选框 + 顶部批量操作条

**列表视图**：表格形式（基于 DataTable 扩展），列：缩略图、文件名、大小、类型、上传时间、引用数、操作。

**筛选/搜索**：
- 文件类型 chip 切换：图片/视频/音频/文档/压缩包/全部
- 顶部搜索框 + 排序下拉（最新/最大/引用最多）

**上传区域**：
- 大块虚线边框 `border-2 border-dashed border-gray-300 hover:border-blue-500`
- 居中图标 + 「拖拽或点击上传」
- hover 状态高亮边框 + 浅蓝背景

**存储位置切换**：下拉菜单选择当前附件的存储位置（需后端支持迁移）。

### 5.15 FriendLinksManager 友链管理

- DataTable 形式
- 列：头像、名称、URL、描述、分组（友人/站点）、排序、操作
- 操作：编辑、删除、申请审核（如果开启）
- 支持拖拽排序（`HTML5 drag` + 顺序提交）

### 5.16 ArticlesView / ArticlesReview 文章与审核

**ArticlesView（我的文章）**：

- DataTable
- 列：标题（line-clamp-1 + hover 显示完整）、分类、状态（草稿/已发布/审核中）、发布时间、浏览量、操作
- `headerActions`：「+ 新建文章」按钮（`bg-blue-500 text-white`）
- 操作列：「编辑」「删除」「预览」
- 顶部筛选：状态切换 Tab

**ArticlesReview（待审核）**：

- 列表/卡片混合
- 快速操作：「通过」「拒绝」「打回修改」
- 拒绝弹窗：输入原因 → 通知作者

### 5.17 CommentsView / CommentsReview 评论与审核

**CommentsView（我的评论）**：

- 时间线/列表，列出我在各文章下的评论 + 回复
- 可删除、跳转原文

**CommentsReview（审核）**：

- 表格：内容、所属文章、作者、时间、操作
- 「通过」「拒绝」「标记垃圾」
- 拒绝时输入原因

### 5.18 RoleManager RBAC 角色管理

**结构**：
- 左：角色列表（管理员/编辑/作者/订阅者）
- 右：选中角色的权限矩阵
  - 权限组：内容、用户、评论、设置、存储、附件、主题、API
  - 每组：行（资源）+ 列（read/create/update/delete）
  - checkbox 网格

**新建角色 Modal**：
- 角色名（必填，唯一）
- 描述
- 默认权限模板选择
- 勾选权限矩阵

### 5.19 ThemesStoreView 主题商店

**网格视图**：
- 主题卡片：预览图 + 主题名 + 作者 + 版本 + 「应用」「详情」按钮
- 顶部筛选：官方/第三方/全部

**详情 Modal**：
- 大预览图
- 描述/版本/兼容性/大小
- 「在线预览」「下载」「应用」按钮
- 截图二次确认覆盖站点

### 5.20 通用 Modal（汇总）

**结构**：
```jsx
<div className="fixed inset-0 backdrop-blur-sm bg-opacity-30" onClick={onClose} />
<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    </div>
    <div className="px-6 py-4 space-y-4">...</div>
    <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
      <button className="bg-white border border-gray-300 ...">取消</button>
      <button className="bg-blue-600 ...">保存</button>
    </div>
  </div>
</div>
```

- 遮罩：`fixed inset-0 backdrop-blur-sm bg-opacity-30` 或 `bg-black/20`
- 卡片：`bg-white rounded-lg shadow-xl max-w-md`，自适应宽度
- 顶部：`px-6 py-4 border-b border-gray-200`
- 中部：`px-6 py-4 space-y-4`
- 底部：`bg-gray-50 px-6 py-4 flex justify-end space-x-3`
- 移动端：`max-w-none max-w-sm mx-4 max-h-[80vh]`

---

## 6. 全局元素

### 6.1 Toast 通知

**位置**：右上角堆叠。

**视觉**：
- `backdrop-filter: blur(6px)` 玻璃模糊
- 浅色：彩色 `*-50` 背景 + 边框 + 文本
- 暗色：半透明深色 + 对应强调色描边与文字

**类型对应**：

| 类型 | 浅色 | 暗色 |
| --- | --- | --- |
| success | `bg-green-50 text-green-800` | 绿底半透明 |
| error | `bg-red-50 text-red-800` | `rgba(127,29,29,0.92)` 红色描边 |
| warning | `bg-yellow-50 text-yellow-800` | `rgba(120,53,15,0.92)` 黄色描边 |
| info | `bg-blue-50 text-blue-800` | `rgba(30,58,138,0.92)` 蓝色描边 |

**结构**：`flex items-start`，左侧图标 + 标题 + 描述，右侧关闭按钮。

**动画**：
- 进入：`slide-in-right 0.4s ease-out`
- 退出：`fade-out 0.3s ease forwards`

### 6.2 Modal 弹窗（前台公告/后台弹窗）

**前台 AnnouncementModal 样式**：
```jsx
<div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 z-50" />
<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
       onClick={e => e.stopPropagation()}>
    <div className="flex justify-between items-center p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">公告</h3>
      <button className="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">&times;</button>
    </div>
    <div className="overflow-y-auto p-4">
      <style>{`.announcement-body img { max-width: 100%; height: auto; margin: 0.75em 0; border-radius: 4px; }`}</style>
      <div className="announcement-body text-sm text-gray-700" dangerouslySetInnerHTML={{__html: sanitized}} />
    </div>
  </div>
</div>
```

**行为**：
- 关闭时写入 localStorage（key 如 `announcement_dismissed_at`），下次 `update_time` 不一致才显示。
- 点击遮罩关闭（弹窗 `onClick stopPropagation`）。
- ESC 关闭（可选）。

### 6.3 ImageLightbox 图片灯箱

**结构**：
```
[遮罩 bg-black/30 backdrop-blur-lg z-[9999]]
   ┌───────────────────────────┐
   │  [重置视图 100%]              [×] │  ← 顶部 toolbar
   │                                 │
   │  ‹           [大图]          ›  │
   │                                 │
   │     [1/5] [⬇ 下载原图]           │  ← 底部 toolbar
   └───────────────────────────┘
```

**容器**：`fixed inset-0 bg-opacity-30 backdrop-blur-lg z-[9999] flex items-center justify-center p-4`

**图片**：
- `max-w-full max-h-[90vh] object-contain`
- 加载前：中心 spinner `h-12 w-12 border-b-2 border-white`
- 加载完成切换显示
- 错误回退 `/image_error.svg`

**交互**：
- `wheel` 缩放：`scale = clamp(prev * delta, 0.5, 3)`，`delta = 0.9 / 1.1`
- 鼠标拖动：`mousedown` + `mousemove`，仅在 `scale > 1` 启用
- `cursor`：缩放 > 1 时 `cursor-move`，否则 `cursor-zoom-in`
- 键盘：`←/→` 切换，`Esc` 关闭
- 关闭时 `document.body.style.overflow = 'unset'`（打开时设为 `hidden`）

**导航按钮**：
- 左右圆形按钮：`absolute left-4 / right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm z-20 shadow-lg`

**顶部工具条**：重置 + 百分比 + 关闭按钮。

**底部工具条**：
- `bottom-4 left-1/2 transform -translate-x-1/2`
- `bg-white bg-opacity-80 ... px-4 py-2 rounded-full backdrop-blur-sm z-50 shadow-lg`
- 内容：`{currentIndex + 1} / {images.length}` + 「⬇ 下载原图」
- 下载：同源加 `?download=true`，外链 `window.open`。

### 6.4 ImageCropper 图片裁剪

- 画布：图片预览 + 可拖拽裁剪框（圆/方）
- 底部工具：缩放、旋转、确认、取消
- 输出：裁剪后的 Blob/File

### 6.5 UploadProgress 上传进度面板

**位置**：右下角浮窗（`fixed right-4 bottom-4 z-50`）。

**结构**：
```
┌─────────────────────────┐
│ 上传列表                  │
├─────────────────────────┤
│ [文件名]                 │
│ ▓▓▓▓▓▓░░░ 60%            │
│ 上传中... / 处理中 / 失败 │
├─────────────────────────┤
│ ...
```

**容器**：`upload-progress-panel`：
```css
.upload-progress-panel {
  animation: upload-progress-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes upload-progress-slide-in {
  from { transform: translateX(calc(100% + 48px)); }
  to { transform: translateX(0); }
}
```

**条目**：
- `upload-progress-item`：进入动画 0.25s cubic-bezier(0.16, 1, 0.3, 1)
- 进度条：`upload-progress-track`（`bg-gray-100`）+ `upload-progress-fill-shimmer`（白条 shimmer 动画）
- 处理中文字：`upload-progress-processing-text`（pulse 1.5s）
- 离开动画：
  - 成功：`upload-progress-item-leaving-done` 延迟 1.1s 后退出
  - 失败：`upload-progress-item-leaving-error` 延迟 3.6s 后退出

**状态 API**：
```js
uploadProgress.start(id, fileName, fileType)
uploadProgress.progress(id, percent)        // 0-100
uploadProgress.processing(id)               // 切换到处理中
uploadProgress.done(id)                     // 成功
uploadProgress.error(id, errorMsg)          // 失败
```

### 6.6 MusicPlayer 悬浮音乐播放器

**位置**：固定左下角（`bottom: 2rem`），默认左偏隐藏部分（默认左偏 `15.84rem`，hover 展开）。

**面板尺寸**：
- 桌面：`18rem × 4.25rem`
- 移动：`15.5rem × 4rem`

**样式**：
```css
.music-player-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 4px 4px 24px rgba(0,0,0,0.08), 2px 2px 8px rgba(0,0,0,0.04);
  padding: 0.5rem; gap: 0.5rem;
  border-radius: 0.75rem;
}
```

**结构**：
```
┌──────┬──────────────────────────┐
│封面  │  [曲目名]               [列表] │
│正方  │  ▓▓▓▓░░░░░░░░░░  (进度条)  │
│3.25  │  [00:30]            [3:45]   │
│rem   │                          │
└──────┴──────────────────────────┘
```

**交互**：
- `hover`：面板从左滑出展开（`left: -15.84rem → 0`，`300ms ease-out`）
- 点击封面：`togglePlay`
- 封面 hover：半透黑色蒙层 + 播放/暂停图标
- 进度条：`cursor-pointer`，点击 seek
- 「列表」按钮：展开播放列表（向上展开的 panel）
- 键盘：`←/→` 切换上一首/下一首
- 进度条颜色：`linear-gradient(90deg, #3b82f6, #60a5fa)`

**播放列表 panel**：
- 展开时：`has-playlist` class，圆角改为 `0 0 0.75rem 0.75rem`
- 项目高度紧凑 `p-1.5`，当前播放 `music-playlist-active`（`bg-blue-500/10 text-blue-700`）

**封面解析**：
- 通过 `music-metadata-browser` 解析 ID3
- 缓存到 `coverCacheRef`

**移动端适配**：
- < 768px 切换为 `15.5rem × 4rem`
- `touchstart` 监听外部点击关闭（替代 hover）

### 6.7 AnnouncementModal 公告弹窗

见 §4.10 与 §6.2。额外：

- DOMPurify sanitize 仅 `img / br` 标签
- `display:flex flex-col` + `max-h-[80vh] overflow-y-auto`

---

## 7. 暗色模式

### 7.1 实现

- `<html>` 添加 `.dark` 类
- `localStorage.theme = 'dark' | 'light'` 持久化
- 切换由 ThemeToggle 触发，涟漪扩散动画

### 7.2 适配原则

| 元素 | 浅色 | 暗色 |
| --- | --- | --- |
| 页面背景 | `bg-gray-50` | `#111827` |
| 卡片背景 | `bg-white` | `#1F2937` |
| 输入框背景 | `bg-white` | `#374151` |
| 边框 | `border-gray-200/300` | `#374151 / #4B5563` |
| 一级文字 | `text-gray-900` | `#F9FAFB` |
| 二级文字 | `text-gray-700` | `#E5E7EB` |
| 弱文字 | `text-gray-500` | `#9CA3AF` |
| 主色悬停 | `hover:text-blue-600` | `#60A5FA` |
| 阴影 | 标准 | 加重到 `0.5` |

### 7.3 关键覆盖点

- `.prose` 内文字统一 `#F9FAFB`，链接 `#3B82F6`，下划线。
- 代码块（react-syntax-highlighter）使用 `oneDark` 配色 + token 颜色覆盖：
  - comment / punctuation：`#64748B / #9CA3AF`
  - property / tag / number：`#EC4899`（粉）
  - selector / string / builtin：`#10B981`（绿）
  - operator / keyword / function：`#8B5CF6`（紫）
  - regex / important：`#F59E0B`（橙）
- Toast：使用 `backdrop-filter: blur(6px)` + 半透明深色 + 强描边。
- 音乐播放器：`rgba(31,41,55,0.88)` + `4px 4px 24px rgba(0,0,0,0.3)`。
- 侧栏：`bg-gray-800` + `border-gray-700`，激活 `bg-blue-800 text-blue-200`。
- 表格：`bg-gray-900` 表头 + `bg-gray-800` 表体。
- 自定义滚动条：`::-webkit-scrollbar-thumb: #6B7280`，hover `#9CA3AF`。
- 文档预览（PDF/Word）：Word 始终白底 + 黑字；PDF canvas 加深阴影。

---

## 8. 响应式断点

| 断点 | 宽度 | 行为 |
| --- | --- | --- |
| Base | < 640px | 单列；移动菜单/移动卡片（横排 h-40）；Dashboard 侧栏抽屉 |
| `sm` | ≥ 640px | 微调内边距；DataTable 内联显示完整列 |
| `md` | ≥ 768px | 显示桌面菜单；网格 2 列；图片开关可见；Dashboard 侧栏常驻 |
| `lg` | ≥ 1024px | 文章详情三栏；侧栏显示；统计 4 列 |
| `xl` | ≥ 1280px | 文章列表网格 3 列；快捷操作 3 列 |

### 移动端特殊处理

- Header 菜单：折叠为汉堡
- 表格：横向滚动 `overflow-x-auto`，关键列优先显示
- Modal：宽度自适应，最大 `max-w-sm mx-4`
- Dashboard 侧栏：从左侧滑出抽屉式（`-translate-x-full → translate-x-0`）
- 音乐播放器：自动切换为紧凑尺寸
- 评论区：嵌套缩进从 `ml-8` 减小或隐藏头像大小

---

## 9. 微交互与动效汇总

### 9.1 Hover

| 元素 | 效果 |
| --- | --- |
| 链接/菜单 | `text-gray-600 → text-blue-600` 200ms |
| 卡片 | `shadow-md → shadow-lg` 200ms + 图片 `scale(1.05)` 300ms |
| 按钮（主） | `bg-blue-600 → bg-blue-700` |
| 标签 | `bg-gray-100 → bg-gray-200` |
| 快捷操作 | `bg-white → bg-gray-50` |
| 表格行 | `bg-white → bg-gray-50` |
| 侧栏切换按钮 | `opacity-0 → opacity-100`（仅 group-hover 时） |

### 9.2 过渡曲线

| 场景 | 曲线 |
| --- | --- |
| 颜色/背景 | `transition-colors duration-200 ease` |
| 阴影 | `transition-shadow duration-200 ease` |
| 缩放（图片） | `transition-transform duration-300 ease` |
| 折叠/展开 | `transition-all duration-300 ease-in-out` |
| 涟漪 | `clip-path` `0.5s ease-out` |
| 滑入 | `cubic-bezier(0.16, 1, 0.3, 1)` |
| 滑出 | `cubic-bezier(0.55, 0, 1, 0.45)` |

### 9.3 状态

- **Active 反馈**：按钮按下 `active:scale-95`（200ms）
- **Focus 反馈**：输入聚焦 `focus:ring-2 focus:ring-blue-500`
- **Disabled**：`disabled:opacity-50 disabled:cursor-not-allowed`

---

## 10. 可访问性

| 项目 | 规范 |
| --- | --- |
| 图标按钮 | 必须 `aria-label` |
| 菜单按钮 | `aria-haspopup` / `aria-expanded` |
| 图片 | 必填 `alt`，缺失回退占位 |
| 输入框 | 关联 `<label htmlFor>` |
| 焦点 | `focus:outline-none focus:ring-2 focus:ring-blue-500` |
| 对比度 | 主文字 vs 背景 ≥ 4.5:1 |
| 键盘 | 支持 Tab/Enter/Esc/方向键导航 |
| 跳过 | 装饰元素 `aria-hidden="true"` |
| 错误提示 | `role="alert"` 或 `aria-live="polite"` |

---

## 11. 错误/空/加载状态规范

### 11.1 加载态

| 场景 | 视觉 |
| --- | --- |
| 页面级 | 居中 `animate-spin h-12 w-12 border-b-2 border-blue-500` + 「加载中...」文字 |
| 卡片骨架 | `animate-pulse bg-gray-200 rounded` 占位 |
| 列表 | `flex items-center justify-center text-gray-500` + `minHeight: holdHeight` 防抖 |
| 表格 | `flex justify-center items-center h-64` + spinner |
| 局部 | 小 spinner `h-5 w-5 border-t-2 border-b-2 border-blue-500` |
| 按钮内 | SVG spinner 内嵌按钮 |

### 11.2 空态

- 居中文字 `text-center py-12 text-gray-500`
- 可配插画/表情图标
- 示例：「暂无文章」「暂无通知」「暂无数据」

### 11.3 错误态

- 行内：`bg-red-50 border border-red-200 rounded-md p-4` + `text-red-700`
- Toast：`bg-red-50 text-red-800`
- 全页错误：红色条 `bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded`

### 11.4 重试机制

- 错误条右侧：「重试」按钮 `text-blue-500 hover:text-blue-700 font-medium`
- 自动重试：MutationObserver/网络监听（可选）

---

## 12. 复用资产清单

### 12.1 设计 Token

颜色、字号、间距、圆角、阴影、动效曲线。

### 12.2 前台组件

1. Header（菜单溢出、自适应）
2. Hero（封面 + 标题 + 副标题）
3. ArticleCard（桌面/移动双布局）
4. ArticleList（网格 + 工具栏 + 分页）
5. CategorySidebar / TagSidebar / RecommendedArticles（统一卡片 + 渐隐遮罩）
6. ArticleReader（三栏 + 封面 + TOC + 密码保护 + 回到顶部）
7. CommentSection（嵌套评论 + 键盘提交）
8. Search（弹出 + 防抖 + 遮罩）
9. ThemeToggle（涟漪切换）
10. Login / Register / ForgotPassword
11. FriendLinks
12. Footer（含 ICP/公安备案）
13. PageNotFound

### 12.3 后台组件

1. Dashboard 容器（Sidebar + Header + Main + Suspense + FadeIn）
2. Sidebar（可折叠 + 子菜单 + 移动抽屉）
3. DashboardHeader（汉堡 + 用户菜单 + 主题切换）
4. DashboardView（统计 + 快捷操作 + 通知 + 无限滚动）
5. DataTable（搜索 + 表头 + 行渲染 + 错误 + 空态）
6. Pagination（带跳转 + 省略号）
7. AvatarUpload
8. AnnouncementManager（编辑/预览双栏）
9. MarkdownEditor（工具栏 + 双栏 + 历史 + 抽屉 + AI）
10. CategoriesView（树形 + Modal）
11. TagsView
12. UsersView
13. SiteSettingsView（多区块表单）
14. UpdateManager（状态条 + Changelog）
15. GlobalAttachmentsManager / UserAttachmentsManager
16. FriendLinksManager
17. ArticlesView / ArticlesReview
18. CommentsView / CommentsReview
19. RoleManager
20. ThemesStoreView

### 12.4 全局元素

1. Toast（4 类 + 玻璃态）
2. Modal（统一规范）
3. ImageLightbox（缩放 + 拖拽 + 键盘）
4. ImageCropper（可选）
5. UploadProgress（右下浮窗）
6. MusicPlayer（左下悬浮 + 列表）
7. AnnouncementModal（自动展示/关闭不再打扰）
8. DocumentPreviewModal（PDF / Word）

---

## 附录 A：图标策略

- **来源**：`lucide-react`（线框 SVG，`strokeWidth={2}`）
- **大小**：
  - `h-3 w-3 / h-4 w-4`：按钮内、标签内
  - `h-5 w-5`：默认工具按钮
  - `h-6 w-6`：Header/卡片图标
  - `text-lg`：侧栏图标
- **颜色**：继承 `currentColor`
- **管理工具**：`utils/IconUtils.jsx` 提供 `getIcon(name)` / `getCategoryIcon()` / `getTagIcon()` 等统一映射
- **自定义 SVG**：特殊图标（音乐音符、统计图表）使用 inline SVG

---

## 附录 B：常用 Tailwind 类速查

```
布局       flex flex-col / flex-row | gap-4 gap-6
          grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
容器       container mx-auto px-4 py-8 | max-w-[1240px]
固定       fixed top-0 left-0 right-0 z-50 | sticky top-28
背景       bg-white | bg-gray-50/100 | bg-blue-500/600
文字       text-gray-900/700/600/500/400 | text-blue-500/600
圆角       rounded-md / rounded-lg / rounded-xl / rounded-full
阴影       shadow-sm / shadow-md / shadow-lg / shadow-xl
过渡       transition-shadow transition-colors transition-transform
          duration-200 / duration-300
动效       animate-pulse | animate-spin
响应式     hidden md:flex | md:hidden | md:w-1/2 | lg:w-1/4 | xl:grid-cols-3
聚焦       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
文字截断   truncate | line-clamp-1 / 2 / 3
分隔       divide-y divide-gray-200 | border-t border-gray-200
滚动条     hide-scrollbar | scrollbar-width: thin
玻璃       bg-white/80 backdrop-blur-md | bg-white/90 backdrop-blur-md
布局数值   w-16 / w-64 / h-9 / h-16 | p-4 p-5 p-6 | py-2 px-3
按钮       bg-blue-500 hover:bg-blue-600 text-white
          bg-gray-100 hover:bg-gray-200 text-gray-700
徽章       bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full
```

---

## 附录 C：键盘快捷键汇总

| 场景 | 快捷键 |
| --- | --- |
| Markdown 编辑器 撤销 | Ctrl+Z |
| Markdown 编辑器 重做 | Ctrl+Shift+Z / Ctrl+Y |
| Markdown 加粗 | Ctrl+B |
| Markdown 斜体 | Ctrl+I |
| Markdown 链接 | Ctrl+K |
| Markdown 代码块 | Ctrl+E |
| 评论提交 | Enter |
| 评论换行 | Shift+Enter |
| Lightbox 上一张 | ← |
| Lightbox 下一张 | → |
| Lightbox 关闭 | Esc |
| 音乐 上一首 | ← |
| 音乐 下一首 | → |

---

> 至此，本规范覆盖了 Dim Stack 项目前/后端全部 UI/UX 细节。后续如有新增组件/状态，应回到本规范追加对应章节，保持设计系统的一致性。