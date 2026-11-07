/**
 * Mock 后端的种子数据。
 *
 * 所有数据只保存在内存里，重启 `bun run mock` 后会重新播种。
 * 字段命名对齐前端实际消费的接口契约（见 mock/README.md）。
 */

export interface CategoryRecord {
  id: number;
  categoryName: string;
  createTime: string;
}

export interface TagRecord {
  id: number;
  tagName: string;
  createTime: string;
}

export interface ArticleRecord {
  id: number;
  userId: number;
  articleTitle: string;
  articleContent: string;
  articleCover: string;
  categoryId: number | null;
  tagIds: number[];
  type: number; // 1 原创 2 转载 3 翻译
  originalUrl: string;
  isTop: boolean;
  isDelete: boolean;
  status: number; // 1 公开 2 私密 3 草稿
  isPassword: boolean;
  viewCount: number;
  createTime: string;
  updateTime: string | null;
}

export interface CommentRecord {
  id: number;
  userId: number;
  nickname: string;
  avatar: string;
  commentContent: string;
  articleId: number;
  parentId: number | null;
  replyUserId: number | null;
  replyNickname: string;
  type: number;
  isReview: boolean;
  isDelete: boolean;
  createTime: string;
}

export interface MessageRecord {
  id: number;
  nickname: string;
  avatar: string;
  messageContent: string;
  time: number | null;
  isReview: boolean;
  createTime: string;
}

export interface TalkRecord {
  id: number;
  userId: number;
  nickname: string;
  avatar: string;
  content: string;
  images: string; // 逗号分隔
  isTop: boolean;
  status: number;
  likeCount: number;
  createTime: string;
}

export interface AlbumRecord {
  id: number;
  albumName: string;
  albumDesc: string;
  albumCover: string;
  status: number;
  createTime: string;
}

export interface PhotoRecord {
  id: number;
  albumId: number;
  photoName: string;
  photoDesc: string;
  photoSrc: string;
  isDelete: boolean;
  createTime: string;
  updateTime: string | null;
}

export interface LinkRecord {
  id: number;
  linkName: string;
  linkAvatar: string;
  linkAddress: string;
  linkIntro: string;
  createTime: string;
}

export interface PageRecord {
  id: number;
  pageName: string;
  pageLabel: string;
  pageCover: string;
  createTime: string;
}

export interface LogRecord {
  id: number;
  module: string;
  type: string;
  uri: string;
  method: string;
  description: string;
  nickname: string;
  ipAddress: string;
  createTime: string;
}

const now = "2026-11-07 09:30:00";

const markdownIntro = `## 为什么要写这个主题

前端工程化走到今天，**构建工具**、**路由约定**和**数据获取**之间的边界越来越模糊。
这篇文章记录我在真实项目里踩过的坑，以及最后沉淀下来的做法。

### 一个最小可用的例子

\`\`\`ts
export async function loader() {
  const res = await fetch("/api/v1/articles");
  return res.json();
}
\`\`\`

> 先让页面跑起来，再谈抽象。

### 小结

1. 保持数据边界清晰
2. 把可复用的逻辑抽成 hook
3. 上线前补齐监控`;

const markdownGo = `## 背景

Go 的泛型落地之后，很多以前靠代码生成完成的模式可以收敛到语言本身。

\`\`\`go
func Map[T, U any](src []T, fn func(T) U) []U {
\tout := make([]U, 0, len(src))
\tfor _, v := range src {
\t\tout = append(out, fn(v))
\t}
\treturn out
}
\`\`\`

## 实践建议

- 不要为了泛型而泛型
- 错误处理保持显式
- 边界处做校验，内部保持简单

### 结语

工具是手段，可维护性才是目的。`;

const markdownBun = `## 为什么是 Bun

Bun 把**包管理、运行时、测试、打包**放在一个二进制里，对于个人项目和小团队非常省心。

### 这次迁移做了什么

| 步骤 | 说明 |
| --- | --- |
| 安装 | \`bun install\` 替换 npm |
| 脚本 | 全部迁移到 \`bun run\` |
| 测试 | \`bun test\` 跑单测 |

\`\`\`bash
bun install
bun run dev
\`\`\`

迁移成本比预期低，收益是更快的冷启动。`;

const markdownDefault = `## 前言

这是一篇示例文章，用于本地 mock 环境展示排版效果。

### 正文

支持 **粗体**、*斜体*、\`行内代码\` 以及链接。

\`\`\`js
console.log("hello, moon");
\`\`\`

### 列表

- 第一项
- 第二项
- 第三项

> 内容仅用于开发调试。`;

export const db = {
  categories: [
    { id: 1, categoryName: "前端开发", createTime: "2026-08-01 10:00:00" },
    { id: 2, categoryName: "后端开发", createTime: "2026-08-01 10:00:00" },
    { id: 3, categoryName: "工程实践", createTime: "2026-08-01 10:00:00" },
    { id: 4, categoryName: "生活随笔", createTime: "2026-08-01 10:00:00" },
  ] as CategoryRecord[],

  tags: [
    { id: 1, tagName: "React", createTime: "2026-08-01 10:00:00" },
    { id: 2, tagName: "Next.js", createTime: "2026-08-01 10:00:00" },
    { id: 3, tagName: "TypeScript", createTime: "2026-08-01 10:00:00" },
    { id: 4, tagName: "Go", createTime: "2026-08-01 10:00:00" },
    { id: 5, tagName: "PostgreSQL", createTime: "2026-08-01 10:00:00" },
    { id: 6, tagName: "架构", createTime: "2026-08-01 10:00:00" },
    { id: 7, tagName: "设计", createTime: "2026-08-01 10:00:00" },
    { id: 8, tagName: "Bun", createTime: "2026-08-01 10:00:00" },
  ] as TagRecord[],

  articles: [
    {
      id: 1,
      userId: 1,
      articleTitle: "Next.js 16 App Router 实战：从布局到流式渲染",
      articleContent: `# Next.js 16 App Router 实战

${markdownIntro}

## 服务端组件与客户端组件的边界

把数据请求尽量留在服务端，交互状态留在客户端。这样 bundle 更小，首屏也更快。

\`\`\`tsx
export default async function Page() {
  const data = await getData();
  return <ArticleList initial={data} />;
}
\`\`\`

## 流式渲染

配合 \`Suspense\`，慢接口不会阻塞整页。

\`\`\`tsx
<Suspense fallback={<Skeleton />}>
  <Comments />
</Suspense>
\`\`\`

## 最后

架构没有银弹，保持简单。`,
      articleCover: "/uploads/cover-1.png",
      categoryId: 1,
      tagIds: [2, 1, 3],
      type: 1,
      originalUrl: "",
      isTop: true,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 2841,
      createTime: "2026-11-06 09:20:00",
      updateTime: "2026-11-06 10:00:00",
    },
    {
      id: 2,
      userId: 1,
      articleTitle: "用 Bun 构建全栈应用的这一年",
      articleContent: `# 用 Bun 构建全栈应用的这一年\n\n${markdownBun}`,
      articleCover: "/uploads/cover-2.png",
      categoryId: 1,
      tagIds: [8, 3],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 1930,
      createTime: "2026-11-03 20:15:00",
      updateTime: null,
    },
    {
      id: 3,
      userId: 1,
      articleTitle: "Go 1.25 泛型与错误处理实践",
      articleContent: `# Go 1.25 泛型与错误处理实践\n\n${markdownGo}`,
      articleCover: "/uploads/cover-3.png",
      categoryId: 2,
      tagIds: [4],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 1422,
      createTime: "2026-10-30 14:05:00",
      updateTime: null,
    },
    {
      id: 4,
      userId: 1,
      articleTitle: "PostgreSQL 索引优化清单",
      articleContent: `# PostgreSQL 索引优化清单\n\n## 先定位慢查询\n\n\`EXPLAIN ANALYZE\` 是第一生产力。\n\n## 常见问题\n\n- 索引列参与了函数运算\n- 统计信息过期\n- 回表次数过多\n\n${markdownDefault}`,
      articleCover: "/uploads/cover-4.png",
      categoryId: 2,
      tagIds: [5, 6],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 987,
      createTime: "2026-10-26 11:40:00",
      updateTime: null,
    },
    {
      id: 5,
      userId: 1,
      articleTitle: "我如何用 React 19 的思想重构后台",
      articleContent: `# 我如何用 React 19 的思想重构后台\n\n${markdownIntro}`,
      articleCover: "/uploads/cover-5.png",
      categoryId: 1,
      tagIds: [1, 3],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 1655,
      createTime: "2026-10-21 16:25:00",
      updateTime: null,
    },
    {
      id: 6,
      userId: 1,
      articleTitle: "从零搭建可观测的前端错误监控",
      articleContent: `# 从零搭建可观测的前端错误监控\n\n## 采集\n\nwindow.onerror、unhandledrejection、资源加载失败。\n\n## 上报\n\n使用 sendBeacon，避免阻塞页面卸载。\n\n## 告警\n\n聚合相同堆栈，按版本观察回归。`,
      articleCover: "/uploads/cover-6.png",
      categoryId: 3,
      tagIds: [6, 3],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 734,
      createTime: "2026-10-18 09:10:00",
      updateTime: null,
    },
    {
      id: 7,
      userId: 1,
      articleTitle: "博客主题改版记录",
      articleContent: `# 博客主题改版记录\n\n这次改版主要调整了留白、字号和卡片层级。\n\n${markdownDefault}`,
      articleCover: "/uploads/cover-7.png",
      categoryId: 4,
      tagIds: [7],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 512,
      createTime: "2026-10-12 19:00:00",
      updateTime: null,
    },
    {
      id: 8,
      userId: 1,
      articleTitle: "一次 RabbitMQ 消息积压排查",
      articleContent: `# 一次 RabbitMQ 消息积压排查\n\n## 现象\n\n队列长度持续上涨，消费端 CPU 不高。\n\n## 排查\n\n最终定位到消费者里有一个同步邮件发送调用。\n\n## 修复\n\n改为异步任务，并给队列加了告警。`,
      articleCover: "/uploads/cover-8.png",
      categoryId: 2,
      tagIds: [4, 6],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 1108,
      createTime: "2026-10-05 13:30:00",
      updateTime: null,
    },
    {
      id: 9,
      userId: 1,
      articleTitle: "TypeScript 类型体操的边界",
      articleContent: `# TypeScript 类型体操的边界\n\n类型应该服务于可读性，而不是炫技。\n\n${markdownIntro}`,
      articleCover: "/uploads/cover-9.png",
      categoryId: 1,
      tagIds: [3],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 2216,
      createTime: "2026-09-28 08:45:00",
      updateTime: null,
    },
    {
      id: 10,
      userId: 1,
      articleTitle: "周末徒步：山与云",
      articleContent: `# 周末徒步：山与云\n\n天气预报说多云，结果一路上都在下雨。\n\n不过山顶的云海确实值得。`,
      articleCover: "/uploads/cover-10.png",
      categoryId: 4,
      tagIds: [],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 366,
      createTime: "2026-09-20 21:10:00",
      updateTime: null,
    },
    {
      id: 11,
      userId: 1,
      articleTitle: "Next.js 图片优化踩坑记",
      articleContent: `# Next.js 图片优化踩坑记\n\n## remotePatterns\n\n配置通配符要谨慎，生产环境最好收紧。\n\n## sizes\n\n没有 sizes 的 fill 图片会下载过大。\n\n${markdownDefault}`,
      articleCover: "/uploads/cover-11.png",
      categoryId: 1,
      tagIds: [2],
      type: 2,
      originalUrl: "https://nextjs.org/docs",
      isTop: false,
      isDelete: false,
      status: 1,
      isPassword: false,
      viewCount: 845,
      createTime: "2026-09-12 10:05:00",
      updateTime: null,
    },
    {
      id: 12,
      userId: 1,
      articleTitle: "私密：给自己的年度复盘",
      articleContent: "# 私密文章\n\n只有管理员可见。",
      articleCover: "",
      categoryId: 4,
      tagIds: [],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 2,
      isPassword: false,
      viewCount: 12,
      createTime: "2026-11-01 22:00:00",
      updateTime: null,
    },
    {
      id: 13,
      userId: 1,
      articleTitle: "草稿：2026 年度总结",
      articleContent: "# 草稿\n\n还在整理素材……",
      articleCover: "",
      categoryId: 4,
      tagIds: [],
      type: 1,
      originalUrl: "",
      isTop: false,
      isDelete: false,
      status: 3,
      isPassword: false,
      viewCount: 0,
      createTime: "2026-11-05 22:30:00",
      updateTime: null,
    },
  ] as ArticleRecord[],

  comments: [
    {
      id: 1,
      userId: 2,
      nickname: "小林",
      avatar: "/uploads/avatar-2.png",
      commentContent: "写得很清楚，服务端组件的边界那段很有共鸣。",
      articleId: 1,
      parentId: null,
      replyUserId: null,
      replyNickname: "",
      type: 1,
      isReview: true,
      isDelete: false,
      createTime: "2026-11-06 11:20:00",
    },
    {
      id: 2,
      userId: 1,
      nickname: "Moon",
      avatar: "/uploads/avatar-1.png",
      commentContent: "谢谢！后面会补一篇讲数据缓存策略的。",
      articleId: 1,
      parentId: 1,
      replyUserId: 2,
      replyNickname: "小林",
      type: 1,
      isReview: true,
      isDelete: false,
      createTime: "2026-11-06 11:42:00",
    },
    {
      id: 3,
      userId: 3,
      nickname: "Aria",
      avatar: "/uploads/avatar-3.png",
      commentContent: "Suspense 那段能再展开讲讲吗？",
      articleId: 1,
      parentId: null,
      replyUserId: null,
      replyNickname: "",
      type: 1,
      isReview: true,
      isDelete: false,
      createTime: "2026-11-06 15:03:00",
    },
    {
      id: 4,
      userId: 4,
      nickname: "过路人",
      avatar: "/uploads/avatar-2.png",
      commentContent: "这条评论还在待审核状态，后台可以看到。",
      articleId: 2,
      parentId: null,
      replyUserId: null,
      replyNickname: "",
      type: 1,
      isReview: false,
      isDelete: false,
      createTime: "2026-11-07 08:10:00",
    },
    {
      id: 5,
      userId: 5,
      nickname: "Kevin",
      avatar: "/uploads/avatar-3.png",
      commentContent: "Bun 的测试速度确实快。",
      articleId: 2,
      parentId: null,
      replyUserId: null,
      replyNickname: "",
      type: 1,
      isReview: true,
      isDelete: false,
      createTime: "2026-11-04 09:00:00",
    },
  ] as CommentRecord[],

  messages: [
    {
      id: 1,
      nickname: "小林",
      avatar: "/uploads/avatar-2.png",
      messageContent: "博客配色很舒服，收藏了。",
      time: 4,
      isReview: true,
      createTime: "2026-11-05 10:12:00",
    },
    {
      id: 2,
      nickname: "Aria",
      avatar: "/uploads/avatar-3.png",
      messageContent: "请问站点是用什么部署的？",
      time: 8,
      isReview: true,
      createTime: "2026-11-04 16:40:00",
    },
    {
      id: 3,
      nickname: "新访客",
      avatar: "/uploads/avatar-2.png",
      messageContent: "这条留言等待审核中。",
      time: 2,
      isReview: false,
      createTime: "2026-11-07 08:25:00",
    },
    {
      id: 4,
      nickname: "Kevin",
      avatar: "/uploads/avatar-3.png",
      messageContent: "期待更多 Go 相关的文章。",
      time: 6,
      isReview: true,
      createTime: "2026-10-28 09:18:00",
    },
  ] as MessageRecord[],

  talks: [
    {
      id: 1,
      userId: 1,
      nickname: "Moon",
      avatar: "/uploads/avatar-1.png",
      content: "今天的晚霞很好看，可惜手机拍不出十分之一。",
      images: "/uploads/photo-1.png,/uploads/photo-2.png",
      isTop: true,
      status: 1,
      likeCount: 23,
      createTime: "2026-11-06 18:30:00",
    },
    {
      id: 2,
      userId: 1,
      nickname: "Moon",
      avatar: "/uploads/avatar-1.png",
      content: "把博客的前端从 npm 迁到了 Bun，冷启动快了不少。",
      images: "",
      isTop: false,
      status: 1,
      likeCount: 11,
      createTime: "2026-11-03 21:05:00",
    },
    {
      id: 3,
      userId: 1,
      nickname: "Moon",
      avatar: "/uploads/avatar-1.png",
      content: "周末整理了一下书架，发现好多买来没拆封的书。",
      images: "/uploads/photo-3.png",
      isTop: false,
      status: 1,
      likeCount: 8,
      createTime: "2026-10-27 15:20:00",
    },
    {
      id: 4,
      userId: 1,
      nickname: "Moon",
      avatar: "/uploads/avatar-1.png",
      content: "私密说说，只有自己能看到。",
      images: "",
      isTop: false,
      status: 2,
      likeCount: 0,
      createTime: "2026-10-20 23:10:00",
    },
  ] as TalkRecord[],

  albums: [
    {
      id: 1,
      albumName: "城市漫步",
      albumDesc: "街角、光影和晚风",
      albumCover: "/uploads/photo-1.png",
      status: 1,
      createTime: "2026-10-01 10:00:00",
    },
    {
      id: 2,
      albumName: "山野之间",
      albumDesc: "徒步路上的风景",
      albumCover: "/uploads/photo-3.png",
      status: 1,
      createTime: "2026-09-15 10:00:00",
    },
    {
      id: 3,
      albumName: "日常碎片",
      albumDesc: "随手记录",
      albumCover: "/uploads/photo-5.png",
      status: 1,
      createTime: "2026-08-20 10:00:00",
    },
  ] as AlbumRecord[],

  photos: [
    { id: 1, albumId: 1, photoName: "街角", photoDesc: "傍晚的街道", photoSrc: "/uploads/photo-1.png", isDelete: false, createTime: "2026-10-01 10:10:00", updateTime: null },
    { id: 2, albumId: 1, photoName: "橱窗", photoDesc: "暖色灯光", photoSrc: "/uploads/photo-2.png", isDelete: false, createTime: "2026-10-01 10:11:00", updateTime: null },
    { id: 3, albumId: 2, photoName: "山脊", photoDesc: "云从脚边经过", photoSrc: "/uploads/photo-3.png", isDelete: false, createTime: "2026-09-15 10:10:00", updateTime: null },
    { id: 4, albumId: 2, photoName: "营地", photoDesc: "夜里很安静", photoSrc: "/uploads/photo-4.png", isDelete: false, createTime: "2026-09-15 10:12:00", updateTime: null },
    { id: 5, albumId: 3, photoName: "早餐", photoDesc: "自制的面包", photoSrc: "/uploads/photo-5.png", isDelete: false, createTime: "2026-08-20 10:10:00", updateTime: null },
    { id: 6, albumId: 3, photoName: "书桌", photoDesc: "新的一周", photoSrc: "/uploads/photo-6.png", isDelete: false, createTime: "2026-08-20 10:13:00", updateTime: null },
  ] as PhotoRecord[],

  links: [
    { id: 1, linkName: "Next.js", linkAvatar: "/uploads/avatar-2.png", linkAddress: "https://nextjs.org", linkIntro: "The React Framework", createTime: "2026-08-01 10:00:00" },
    { id: 2, linkName: "Bun", linkAvatar: "/uploads/avatar-3.png", linkAddress: "https://bun.sh", linkIntro: "A fast all-in-one JavaScript runtime", createTime: "2026-08-01 10:00:00" },
    { id: 3, linkName: "Go", linkAvatar: "/uploads/avatar-2.png", linkAddress: "https://go.dev", linkIntro: "Build simple, secure, scalable systems", createTime: "2026-08-01 10:00:00" },
    { id: 4, linkName: "PostgreSQL", linkAvatar: "/uploads/avatar-3.png", linkAddress: "https://www.postgresql.org", linkIntro: "The world's most advanced open source database", createTime: "2026-08-01 10:00:00" },
  ] as LinkRecord[],

  pages: [
    { id: 1, pageName: "首页", pageLabel: "home", pageCover: "/uploads/cover-1.png", createTime: "2026-08-01 10:00:00" },
    { id: 2, pageName: "归档", pageLabel: "archive", pageCover: "/uploads/cover-2.png", createTime: "2026-08-01 10:00:00" },
    { id: 3, pageName: "分类", pageLabel: "category", pageCover: "/uploads/cover-3.png", createTime: "2026-08-01 10:00:00" },
    { id: 4, pageName: "标签", pageLabel: "tag", pageCover: "/uploads/cover-4.png", createTime: "2026-08-01 10:00:00" },
    { id: 5, pageName: "友链", pageLabel: "link", pageCover: "/uploads/cover-5.png", createTime: "2026-08-01 10:00:00" },
  ] as PageRecord[],

  logs: [
    { id: 6, module: "文章管理", type: "新增", uri: "/admin/articles", method: "POST", description: "发布文章《Next.js 16 App Router 实战》", nickname: "管理员", ipAddress: "127.0.0.1", createTime: "2026-11-06 09:20:00" },
    { id: 5, module: "评论管理", type: "审核", uri: "/admin/comments/review", method: "PUT", description: "通过 1 条评论", nickname: "管理员", ipAddress: "127.0.0.1", createTime: "2026-11-05 14:02:00" },
    { id: 4, module: "分类管理", type: "新增", uri: "/admin/categories", method: "POST", description: "新增分类「工程实践」", nickname: "管理员", ipAddress: "127.0.0.1", createTime: "2026-11-04 10:30:00" },
    { id: 3, module: "说说管理", type: "新增", uri: "/admin/talks", method: "POST", description: "发布一条说说", nickname: "管理员", ipAddress: "127.0.0.1", createTime: "2026-11-03 21:05:00" },
    { id: 2, module: "站点设置", type: "更新", uri: "/admin/website/config", method: "PUT", description: "更新站点配置", nickname: "管理员", ipAddress: "127.0.0.1", createTime: "2026-11-02 16:12:00" },
    { id: 1, module: "相册管理", type: "新增", uri: "/admin/albums", method: "POST", description: "创建相册「城市漫步」", nickname: "管理员", ipAddress: "127.0.0.1", createTime: "2026-10-01 10:00:00" },
  ] as LogRecord[],

  about: {
    id: 1,
    banner: "/uploads/cover-1.png",
    avatar: "/uploads/avatar-1.png",
    nickname: "Moon",
    pronouns: "she/her",
    intro: "写代码，也写生活。",
    subtitle: "Frontend & Backend",
    bio: "你好，我是 Moon。\n\n这里记录一些关于 **前端工程**、**后端架构** 和日常生活的碎片。\n\n目前主要使用 Next.js、TypeScript、Go 和 PostgreSQL。",
    aboutPoints: JSON.stringify([
      { emoji: "💻", text: "白天写业务代码，晚上折腾个人项目" },
      { emoji: "📚", text: "喜欢读技术书和散文" },
      { emoji: "🏔️", text: "周末尽量去山里走走" },
    ]),
    email: "moon@example.com",
    website: "https://example.com",
    github: "https://github.com/example",
    followers: 128,
    following: 36,
    techStack: JSON.stringify([
      { name: "Next.js", icon: "▲", color: "#000000" },
      { name: "React", icon: "⚛", color: "#61dafb" },
      { name: "TypeScript", icon: "TS", color: "#3178c6" },
      { name: "Go", icon: "GO", color: "#00add8" },
      { name: "PostgreSQL", icon: "🐘", color: "#336791" },
    ]),
    backendSkills: "Go、PostgreSQL、Redis、RabbitMQ",
    frontendSkills: "React、Next.js、TypeScript、Tailwind CSS",
    otherSkills: "Docker、Nginx、Linux",
    achievements: JSON.stringify([
      { name: "持续写作", icon: "✍️", color: "#2563eb" },
      { name: "开源贡献", icon: "🌱", color: "#16a34a" },
    ]),
    createTime: "2026-08-01 10:00:00",
    updateTime: now,
  },

  websiteConfig: JSON.stringify(
    {
      name: "Moon Blog",
      author: "Moon",
      slogan: "写代码，也写生活",
      avatar: "/uploads/avatar-1.png",
      copyright: "© 2026 Moon Blog",
      icpRecord: "京ICP备 00000000 号",
      mpsRecord: "",
      socials: [
        { name: "GitHub", icon: "github", url: "https://github.com/example" },
        { name: "Email", icon: "mail", url: "mailto:moon@example.com" },
      ],
    },
    null,
    2,
  ),
};

export const nextIds = {
  article: 14,
  category: 5,
  tag: 9,
  comment: 6,
  message: 5,
  talk: 5,
  album: 4,
  photo: 7,
  link: 5,
  page: 6,
  log: 7,
};

export const likes = {
  articles: new Set<number>(),
  talks: new Set<number>(),
};
