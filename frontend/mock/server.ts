/**
 * Moon Blog 本地 Mock 后端（Bun）
 *
 * 目的：不启动 Go / PostgreSQL / Redis / MQ 的前提下，让前端所有页面都能拿到数据。
 *
 *   bun run mock        # → http://localhost:8080
 *
 * 接口前缀同时兼容 /api/v1/*（浏览器侧）和 /api/*（首页 SSR 直连），
 * 数据保存在内存里，重启即恢复种子数据。
 */
import { deflateSync } from "node:zlib";
import {
  db,
  nextIds,
  likes,
  type ArticleRecord,
  type CommentRecord,
  type MessageRecord,
  type AlbumRecord,
  type PhotoRecord,
  type LinkRecord,
  type PageRecord,
} from "./data";

const PORT = Number(process.env.MOCK_PORT || 8080);
const ADMIN_PASSWORD = process.env.MOCK_ADMIN_PASSWORD || "12345678";

/* -------------------------------------------------------------------------- */
/* 响应工具                                                                    */
/* -------------------------------------------------------------------------- */

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

function ok(data: unknown = null): Response {
  return json({ code: 20000, flag: true, message: "操作成功", data });
}

function fail(message: string, code = 50000): Response {
  return json({ code, flag: false, message, data: null });
}

function unauthorized(): Response {
  return json(
    { code: 40001, flag: false, message: "未登录或登录已过期", data: null },
    401,
  );
}

function notFound(): Response {
  return json({ code: 40004, flag: false, message: "接口不存在", data: null }, 404);
}

async function readBody<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

function pageOf<T>(list: T[], page: number, size: number) {
  return {
    records: list.slice((page - 1) * size, page * size),
    count: list.length,
    current: page,
    size,
  };
}

function pageParams(url: URL) {
  const current = Math.max(1, Number(url.searchParams.get("current")) || 1);
  const size = Math.max(
    1,
    Math.min(1000, Number(url.searchParams.get("size")) || 10),
  );
  return { current, size };
}

function nowString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* -------------------------------------------------------------------------- */
/* 占位图片：按路径生成不同颜色的渐变 PNG                                       */
/* -------------------------------------------------------------------------- */

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

const imageCache = new Map<string, Uint8Array>();

function makeImage(seed: string, width: number, height: number): Uint8Array {
  const key = `${seed}:${width}x${height}`;
  const cached = imageCache.get(key);
  if (cached) return cached;

  const hash = hashString(seed);
  const hue = hash % 360;
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const dx = x / width;
      const dy = y / height;
      const ring = Math.sin((dx + dy) * Math.PI * 2 + (hash % 100) / 20);
      const [r, g, b] = hslToRgb(
        hue + dx * 36 + ring * 8,
        0.55,
        0.3 + dy * 0.28 + ring * 0.04,
      );
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);

  const bytes = new Uint8Array(png);
  imageCache.set(key, bytes);
  return bytes;
}

function serveImage(pathname: string): Response {
  const name = pathname.replace(/^\/uploads\//, "").replace(/\.[a-z]+$/i, "");
  const isAvatar = name.includes("avatar");
  const width = isAvatar ? 256 : 960;
  const height = isAvatar ? 256 : 600;
  const bytes = makeImage(name, width, height);
  return new Response(bytes, {
    status: 200,
    headers: {
      ...CORS,
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

/* -------------------------------------------------------------------------- */
/* 数据视图                                                                    */
/* -------------------------------------------------------------------------- */

function categoryOf(id: number | null) {
  return id == null ? undefined : db.categories.find((c) => c.id === id);
}

function tagsOf(ids: number[]) {
  return db.tags.filter((t) => ids.includes(t.id));
}

function tagVOList(a: ArticleRecord) {
  return tagsOf(a.tagIds).map((t) => ({ id: t.id, tagName: t.tagName }));
}

function toHomeArticle(a: ArticleRecord) {
  const category = categoryOf(a.categoryId);
  return {
    id: a.id,
    articleCover: a.articleCover,
    articleTitle: a.articleTitle,
    articleContent: a.articleContent,
    isTop: a.isTop,
    type: a.type,
    status: a.status,
    createTime: a.createTime,
    categoryId: a.categoryId,
    categoryName: category?.categoryName ?? "",
    viewCount: a.viewCount,
    tagVOList: tagVOList(a),
  };
}

function toAdminArticle(a: ArticleRecord) {
  return {
    ...toHomeArticle(a),
    userId: a.userId,
    tagNameList: tagsOf(a.tagIds).map((t) => t.tagName),
    originalUrl: a.originalUrl,
    isDelete: a.isDelete,
    isPassword: a.isPassword,
    updateTime: a.updateTime,
  };
}

function toArticleDetail(a: ArticleRecord) {
  const category = categoryOf(a.categoryId);
  return {
    ...toAdminArticle(a),
    category: category
      ? { id: category.id, categoryName: category.categoryName }
      : null,
    tags: tagsOf(a.tagIds).map((t) => ({ id: t.id, tagName: t.tagName })),
  };
}

function publicArticles(): ArticleRecord[] {
  return db.articles
    .filter((a) => !a.isDelete && a.status === 1)
    .sort((a, b) => {
      if (a.isTop !== b.isTop) return a.isTop ? -1 : 1;
      return b.id - a.id;
    });
}

/* -------------------------------------------------------------------------- */
/* 路由                                                                        */
/* -------------------------------------------------------------------------- */

function addLog(module: string, type: string, uri: string, method: string, description: string) {
  db.logs.unshift({
    id: nextIds.log++,
    module,
    type,
    uri,
    method,
    description,
    nickname: "管理员",
    ipAddress: "127.0.0.1",
    createTime: nowString(),
  });
  if (db.logs.length > 200) db.logs.length = 200;
}

function requireAuth(req: Request): boolean {
  const header = req.headers.get("authorization") || "";
  return header.startsWith("Bearer ") && header.length > "Bearer ".length;
}

function resolveCategoryByName(name?: string): number | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  const found = db.categories.find((c) => c.categoryName === trimmed);
  if (found) return found.id;
  const created = { id: nextIds.category++, categoryName: trimmed, createTime: nowString() };
  db.categories.push(created);
  return created.id;
}

function resolveTagIdsByName(names?: string[]): number[] {
  if (!names?.length) return [];
  return names
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((name) => {
      const found = db.tags.find((t) => t.tagName === name);
      if (found) return found.id;
      const created = { id: nextIds.tag++, tagName: name, createTime: nowString() };
      db.tags.push(created);
      return created.id;
    });
}

async function handleAdmin(req: Request, url: URL, path: string): Promise<Response> {
  const method = req.method;

  /* ---------------- 仪表盘 ---------------- */
  if (path === "/admin" && method === "GET") {
    const categoryList = db.categories.map((c) => ({
      name: c.categoryName,
      value: db.articles.filter((a) => a.categoryId === c.id && !a.isDelete).length,
    }));
    const tagDTOList = db.tags.map((t) => ({
      name: t.tagName,
      value: db.articles.filter((a) => a.tagIds.includes(t.id) && !a.isDelete).length,
    }));
    return ok({
      articleCount: db.articles.filter((a) => !a.isDelete).length,
      userCount: 1,
      messageCount: db.messages.length,
      viewCount: db.articles.reduce((sum, a) => sum + a.viewCount, 0),
      categoryList,
      tagDTOList,
      articleStatisticsList: [
        { date: "2026-11-05", count: 1 },
        { date: "2026-11-06", count: 1 },
        { date: "2026-11-07", count: 0 },
      ],
      viewList: [
        { date: "2026-11-05", count: 128 },
        { date: "2026-11-06", count: 203 },
        { date: "2026-11-07", count: 76 },
      ],
    });
  }

  /* ---------------- 文章 ---------------- */
  if (path === "/admin/articles" && method === "GET") {
    const { current, size } = pageParams(url);
    const keyword = url.searchParams.get("keywords")?.toLowerCase() || "";
    const status = url.searchParams.get("status");
    const categoryId = url.searchParams.get("categoryId");
    const type = url.searchParams.get("type");
    const isDelete = url.searchParams.get("isDelete");

    let list = db.articles.filter((a) =>
      isDelete == null ? !a.isDelete : a.isDelete === (isDelete === "true"),
    );
    if (keyword) {
      list = list.filter(
        (a) =>
          a.articleTitle.toLowerCase().includes(keyword) ||
          a.articleContent.toLowerCase().includes(keyword),
      );
    }
    if (status) list = list.filter((a) => a.status === Number(status));
    if (categoryId) list = list.filter((a) => a.categoryId === Number(categoryId));
    if (type) list = list.filter((a) => a.type === Number(type));

    list = [...list].sort((a, b) => {
      if (a.isTop !== b.isTop) return a.isTop ? -1 : 1;
      return b.id - a.id;
    });

    const page = pageOf(list, current, size);
    return ok({ ...page, records: page.records.map(toAdminArticle) });
  }

  if (path === "/admin/articles" && method === "POST") {
    const body = await readBody<{
      id?: number;
      articleTitle?: string;
      articleContent?: string;
      articleCover?: string;
      categoryName?: string;
      tagNameList?: string[];
      type?: number;
      originalUrl?: string;
      isTop?: boolean;
      status?: number;
    }>(req);

    if (!body.articleTitle || !body.articleContent) {
      return fail("请输入文章标题和内容", 40010);
    }

    const categoryId = resolveCategoryByName(body.categoryName);
    const tagIds = resolveTagIdsByName(body.tagNameList);
    const stamp = nowString();

    if (body.id) {
      const article = db.articles.find((a) => a.id === body.id);
      if (!article) return fail("文章不存在", 40004);
      Object.assign(article, {
        articleTitle: body.articleTitle,
        articleContent: body.articleContent,
        articleCover: body.articleCover ?? "",
        categoryId,
        tagIds,
        type: body.type ?? 1,
        originalUrl: body.originalUrl ?? "",
        isTop: body.isTop ?? article.isTop,
        status: body.status ?? article.status,
        updateTime: stamp,
      });
      addLog("文章管理", "更新", "/admin/articles", "POST", `更新文章《${body.articleTitle}》`);
      return ok(article.id);
    }

    const article: ArticleRecord = {
      id: nextIds.article++,
      userId: 1,
      articleTitle: body.articleTitle,
      articleContent: body.articleContent,
      articleCover: body.articleCover ?? "",
      categoryId,
      tagIds,
      type: body.type ?? 1,
      originalUrl: body.originalUrl ?? "",
      isTop: body.isTop ?? false,
      isDelete: false,
      status: body.status ?? 1,
      isPassword: false,
      viewCount: 0,
      createTime: stamp,
      updateTime: null,
    };
    db.articles.push(article);
    addLog("文章管理", "新增", "/admin/articles", "POST", `发布文章《${article.articleTitle}》`);
    return ok(article.id);
  }

  if (path === "/admin/articles" && method === "PUT") {
    const body = await readBody<{ idList?: number[]; isDelete?: boolean }>(req);
    for (const id of body.idList ?? []) {
      const article = db.articles.find((a) => a.id === id);
      if (article) article.isDelete = body.isDelete ?? true;
    }
    addLog("文章管理", "删除", "/admin/articles", "PUT", `软删除 ${body.idList?.length ?? 0} 篇文章`);
    return ok(null);
  }

  if (path === "/admin/articles" && method === "DELETE") {
    const ids = await readBody<number[]>(req);
    const list = Array.isArray(ids) ? ids : [];
    db.articles = db.articles.filter((a) => !list.includes(a.id));
    addLog("文章管理", "删除", "/admin/articles", "DELETE", `彻底删除 ${list.length} 篇文章`);
    return ok(null);
  }

  if (path === "/admin/articles/top" && method === "PUT") {
    const body = await readBody<{ id?: number; isTop?: boolean }>(req);
    const article = db.articles.find((a) => a.id === body.id);
    if (!article) return fail("文章不存在", 40004);
    article.isTop = body.isTop ?? false;
    addLog("文章管理", "更新", "/admin/articles/top", "PUT", `${article.isTop ? "置顶" : "取消置顶"}《${article.articleTitle}》`);
    return ok(null);
  }

  if (path === "/admin/articles/publish" && method === "PUT") {
    const body = await readBody<{ id?: number }>(req);
    const article = db.articles.find((a) => a.id === body.id);
    if (!article) return fail("文章不存在", 40004);
    article.status = 1;
    article.updateTime = nowString();
    addLog("文章管理", "发布", "/admin/articles/publish", "PUT", `发布文章《${article.articleTitle}》`);
    return ok(null);
  }

  if (path === "/admin/articles/images" && method === "POST") {
    // 不解析 multipart，直接返回一个可访问的占位图地址
    return ok(`/uploads/upload-${Date.now()}.png`);
  }

  const adminArticleMatch = path.match(/^\/admin\/articles\/(\d+)$/);
  if (adminArticleMatch && method === "GET") {
    const article = db.articles.find((a) => a.id === Number(adminArticleMatch[1]));
    if (!article) return fail("文章不存在", 40004);
    return ok(toArticleDetail(article));
  }

  /* ---------------- 分类 ---------------- */
  if (path === "/admin/categories" && method === "GET") {
    return ok(
      db.categories.map((c) => ({
        ...c,
        articleCount: db.articles.filter((a) => a.categoryId === c.id && !a.isDelete).length,
      })),
    );
  }

  if (path === "/admin/categories/search" && method === "GET") {
    const keyword = (url.searchParams.get("keywords") || "").toLowerCase();
    return ok(
      db.categories
        .filter((c) => c.categoryName.toLowerCase().includes(keyword))
        .map((c) => ({
          ...c,
          articleCount: db.articles.filter((a) => a.categoryId === c.id && !a.isDelete).length,
        })),
    );
  }

  if (path === "/admin/categories" && method === "POST") {
    const body = await readBody<{ id?: number | null; categoryName?: string }>(req);
    const name = body.categoryName?.trim();
    if (!name) return fail("请输入分类名称", 40010);
    if (body.id) {
      const category = db.categories.find((c) => c.id === body.id);
      if (!category) return fail("分类不存在", 40004);
      category.categoryName = name;
      addLog("分类管理", "更新", "/admin/categories", "POST", `更新分类「${name}」`);
      return ok(null);
    }
    db.categories.push({ id: nextIds.category++, categoryName: name, createTime: nowString() });
    addLog("分类管理", "新增", "/admin/categories", "POST", `新增分类「${name}」`);
    return ok(null);
  }

  if (path === "/admin/categories" && method === "DELETE") {
    const ids = await readBody<number[]>(req);
    const list = Array.isArray(ids) ? ids : [];
    db.categories = db.categories.filter((c) => !list.includes(c.id));
    for (const article of db.articles) {
      if (article.categoryId != null && list.includes(article.categoryId)) {
        article.categoryId = null;
      }
    }
    addLog("分类管理", "删除", "/admin/categories", "DELETE", `删除 ${list.length} 个分类`);
    return ok(null);
  }

  /* ---------------- 标签 ---------------- */
  if (path === "/admin/tags" && method === "GET") {
    return ok(
      db.tags.map((t) => ({
        ...t,
        articleCount: db.articles.filter((a) => a.tagIds.includes(t.id) && !a.isDelete).length,
      })),
    );
  }

  if (path === "/admin/tags" && method === "POST") {
    const body = await readBody<{ id?: number | null; tagName?: string }>(req);
    const name = body.tagName?.trim();
    if (!name) return fail("请输入标签名称", 40010);
    if (body.id) {
      const tag = db.tags.find((t) => t.id === body.id);
      if (!tag) return fail("标签不存在", 40004);
      tag.tagName = name;
      addLog("标签管理", "更新", "/admin/tags", "POST", `更新标签「${name}」`);
      return ok(null);
    }
    db.tags.push({ id: nextIds.tag++, tagName: name, createTime: nowString() });
    addLog("标签管理", "新增", "/admin/tags", "POST", `新增标签「${name}」`);
    return ok(null);
  }

  if (path === "/admin/tags" && method === "DELETE") {
    const ids = await readBody<number[]>(req);
    const list = Array.isArray(ids) ? ids : [];
    db.tags = db.tags.filter((t) => !list.includes(t.id));
    for (const article of db.articles) {
      article.tagIds = article.tagIds.filter((id) => !list.includes(id));
    }
    addLog("标签管理", "删除", "/admin/tags", "DELETE", `删除 ${list.length} 个标签`);
    return ok(null);
  }

  /* ---------------- 说说 ---------------- */
  if (path === "/admin/talks" && method === "GET") {
    const { current, size } = pageParams(url);
    const status = url.searchParams.get("status");
    let list = [...db.talks];
    if (status) list = list.filter((t) => t.status === Number(status));
    list.sort((a, b) => b.id - a.id);
    const page = pageOf(list, current, size);
    return ok({
      ...page,
      records: page.records.map((t) => ({
        id: t.id,
        content: t.content,
        images: t.images,
        isTop: t.isTop ? 1 : 0,
        status: t.status,
        createTime: t.createTime,
      })),
    });
  }

  if (path === "/admin/talks" && method === "POST") {
    const body = await readBody<{
      id?: number;
      content?: string;
      images?: string;
      status?: number;
      isTop?: boolean;
    }>(req);
    if (!body.content?.trim()) return fail("请输入说说内容", 40010);
    if (body.id) {
      const talk = db.talks.find((t) => t.id === body.id);
      if (!talk) return fail("说说不存在", 40004);
      talk.content = body.content;
      talk.images = body.images ?? "";
      talk.status = body.status ?? talk.status;
      addLog("说说管理", "更新", "/admin/talks", "POST", "更新一条说说");
      return ok(null);
    }
    db.talks.push({
      id: nextIds.talk++,
      userId: 1,
      nickname: "Moon",
      avatar: "/uploads/avatar-1.png",
      content: body.content,
      images: body.images ?? "",
      isTop: body.isTop ?? false,
      status: body.status ?? 1,
      likeCount: 0,
      createTime: nowString(),
    });
    addLog("说说管理", "新增", "/admin/talks", "POST", "发布一条说说");
    return ok(null);
  }

  if (path === "/admin/talks" && method === "DELETE") {
    const ids = await readBody<number[]>(req);
    const list = Array.isArray(ids) ? ids : [];
    db.talks = db.talks.filter((t) => !list.includes(t.id));
    addLog("说说管理", "删除", "/admin/talks", "DELETE", `删除 ${list.length} 条说说`);
    return ok(null);
  }

  /* ---------------- 评论管理 ---------------- */
  if (path === "/admin/comments" && method === "GET") {
    const { current, size } = pageParams(url);
    const keyword = (url.searchParams.get("keywords") || "").toLowerCase();
    const isReview = url.searchParams.get("isReview");
    let list = db.comments.filter((c) => !c.isDelete);
    if (keyword) list = list.filter((c) => c.commentContent.toLowerCase().includes(keyword));
    if (isReview != null) list = list.filter((c) => c.isReview === (isReview === "true"));
    list = [...list].sort((a, b) => b.id - a.id);
    const page = pageOf(list, current, size);
    return ok({
      ...page,
      records: page.records.map((c) => ({
        id: c.id,
        nickname: c.nickname,
        avatar: c.avatar,
        commentContent: c.commentContent,
        articleTitle: db.articles.find((a) => a.id === c.articleId)?.articleTitle ?? "",
        isReview: c.isReview,
        createTime: c.createTime,
      })),
    });
  }

  if (path === "/admin/comments/review" && method === "PUT") {
    const body = await readBody<{ idList?: number[]; isReview?: boolean }>(req);
    for (const id of body.idList ?? []) {
      const comment = db.comments.find((c) => c.id === id);
      if (comment) comment.isReview = body.isReview ?? true;
    }
    addLog("评论管理", "审核", "/admin/comments/review", "PUT", `审核 ${body.idList?.length ?? 0} 条评论`);
    return ok(null);
  }

  if (path === "/admin/comments" && method === "DELETE") {
    const ids = await readBody<number[]>(req);
    const list = Array.isArray(ids) ? ids : [];
    db.comments = db.comments.filter((c) => !list.includes(c.id));
    addLog("评论管理", "删除", "/admin/comments", "DELETE", `删除 ${list.length} 条评论`);
    return ok(null);
  }

  /* ---------------- 留言管理 ---------------- */
  if (path === "/admin/messages" && method === "GET") {
    const { current, size } = pageParams(url);
    const keyword = (url.searchParams.get("keywords") || "").toLowerCase();
    const isReview = url.searchParams.get("isReview");
    let list = [...db.messages];
    if (keyword) list = list.filter((m) => m.messageContent.toLowerCase().includes(keyword));
    if (isReview != null) list = list.filter((m) => m.isReview === (isReview === "true"));
    list.sort((a, b) => b.id - a.id);
    const page = pageOf(list, current, size);
    return ok({
      ...page,
      records: page.records.map((m) => ({
        id: m.id,
        nickname: m.nickname,
        avatar: m.avatar,
        messageContent: m.messageContent,
        isReview: m.isReview,
        createTime: m.createTime,
      })),
    });
  }

  if (path === "/admin/messages/review" && method === "PUT") {
    const body = await readBody<{ idList?: number[]; isReview?: boolean }>(req);
    for (const id of body.idList ?? []) {
      const message = db.messages.find((m) => m.id === id);
      if (message) message.isReview = body.isReview ?? true;
    }
    addLog("留言管理", "审核", "/admin/messages/review", "PUT", `审核 ${body.idList?.length ?? 0} 条留言`);
    return ok(null);
  }

  if (path === "/admin/messages" && method === "DELETE") {
    const ids = await readBody<number[]>(req);
    const list = Array.isArray(ids) ? ids : [];
    db.messages = db.messages.filter((m) => !list.includes(m.id));
    addLog("留言管理", "删除", "/admin/messages", "DELETE", `删除 ${list.length} 条留言`);
    return ok(null);
  }

  /* ---------------- 相册 ---------------- */
  if (path === "/admin/albums" && method === "GET") {
    return ok(
      db.albums.map((a) => ({
        ...a,
        photoCount: db.photos.filter((p) => p.albumId === a.id && !p.isDelete).length,
      })),
    );
  }

  if (path === "/admin/albums" && method === "POST") {
    const body = await readBody<Partial<AlbumRecord> & { id?: number }>(req);
    if (!body.albumName?.trim()) return fail("请输入相册名称", 40010);
    if (body.id) {
      const album = db.albums.find((a) => a.id === body.id);
      if (!album) return fail("相册不存在", 40004);
      Object.assign(album, {
        albumName: body.albumName,
        albumDesc: body.albumDesc ?? album.albumDesc,
        albumCover: body.albumCover ?? album.albumCover,
        status: body.status ?? album.status,
      });
      addLog("相册管理", "更新", "/admin/albums", "POST", `更新相册「${body.albumName}」`);
      return ok(null);
    }
    db.albums.push({
      id: nextIds.album++,
      albumName: body.albumName,
      albumDesc: body.albumDesc ?? "",
      albumCover: body.albumCover ?? "",
      status: body.status ?? 1,
      createTime: nowString(),
    });
    addLog("相册管理", "新增", "/admin/albums", "POST", `创建相册「${body.albumName}」`);
    return ok(null);
  }

  const albumDeleteMatch = path.match(/^\/admin\/albums\/(\d+)$/);
  if (albumDeleteMatch && method === "DELETE") {
    const id = Number(albumDeleteMatch[1]);
    db.albums = db.albums.filter((a) => a.id !== id);
    db.photos = db.photos.filter((p) => p.albumId !== id);
    addLog("相册管理", "删除", `/admin/albums/${id}`, "DELETE", "删除相册");
    return ok(null);
  }

  const albumPhotosMatch = path.match(/^\/admin\/albums\/(\d+)\/photos$/);
  if (albumPhotosMatch && method === "GET") {
    const { current, size } = pageParams(url);
    const list = db.photos
      .filter((p) => p.albumId === Number(albumPhotosMatch[1]) && !p.isDelete)
      .sort((a, b) => b.id - a.id);
    return ok(pageOf(list, current, size));
  }

  if (path === "/admin/photos" && method === "POST") {
    const body = await readBody<{ albumId?: number; photoUrlList?: string[] }>(req);
    if (!body.albumId || !body.photoUrlList?.length) return fail("参数错误", 40010);
    const stamp = nowString();
    for (const [index, src] of body.photoUrlList.entries()) {
      db.photos.push({
        id: nextIds.photo++,
        albumId: body.albumId,
        photoName: `照片 ${index + 1}`,
        photoDesc: "",
        photoSrc: src,
        isDelete: false,
        createTime: stamp,
        updateTime: null,
      });
    }
    addLog("照片管理", "新增", "/admin/photos", "POST", `新增 ${body.photoUrlList.length} 张照片`);
    return ok(null);
  }

  if (path === "/admin/photos" && method === "PUT") {
    const photos = await readBody<PhotoRecord[]>(req);
    for (const patch of Array.isArray(photos) ? photos : []) {
      const photo = db.photos.find((p) => p.id === patch.id);
      if (photo) Object.assign(photo, patch, { updateTime: nowString() });
    }
    addLog("照片管理", "更新", "/admin/photos", "PUT", "更新照片信息");
    return ok(null);
  }

  if (path === "/admin/photos" && method === "DELETE") {
    const ids = await readBody<number[]>(req);
    const list = Array.isArray(ids) ? ids : [];
    db.photos = db.photos.filter((p) => !list.includes(p.id));
    addLog("照片管理", "删除", "/admin/photos", "DELETE", `删除 ${list.length} 张照片`);
    return ok(null);
  }

  /* ---------------- 友链 ---------------- */
  if (path === "/admin/links" && method === "GET") {
    return ok(db.links);
  }

  if (path === "/admin/links" && method === "POST") {
    const body = await readBody<Partial<LinkRecord> & { id?: number }>(req);
    if (!body.linkName?.trim()) return fail("请输入友链名称", 40010);
    if (body.id) {
      const link = db.links.find((l) => l.id === body.id);
      if (link) Object.assign(link, body);
      addLog("友链管理", "更新", "/admin/links", "POST", `更新友链「${body.linkName}」`);
      return ok(null);
    }
    db.links.push({
      id: nextIds.link++,
      linkName: body.linkName,
      linkAvatar: body.linkAvatar ?? "",
      linkAddress: body.linkAddress ?? "",
      linkIntro: body.linkIntro ?? "",
      createTime: nowString(),
    });
    addLog("友链管理", "新增", "/admin/links", "POST", `新增友链「${body.linkName}」`);
    return ok(null);
  }

  if (path === "/admin/links" && method === "DELETE") {
    const ids = await readBody<number[]>(req);
    const list = Array.isArray(ids) ? ids : [];
    db.links = db.links.filter((l) => !list.includes(l.id));
    addLog("友链管理", "删除", "/admin/links", "DELETE", `删除 ${list.length} 个友链`);
    return ok(null);
  }

  /* ---------------- 页面 ---------------- */
  if (path === "/admin/pages" && method === "GET") {
    return ok(db.pages);
  }

  if (path === "/admin/pages" && method === "POST") {
    const body = await readBody<Partial<PageRecord> & { id?: number }>(req);
    if (!body.pageName?.trim()) return fail("请输入页面名称", 40010);
    if (body.id) {
      const page = db.pages.find((p) => p.id === body.id);
      if (page) Object.assign(page, body);
      return ok(null);
    }
    db.pages.push({
      id: nextIds.page++,
      pageName: body.pageName,
      pageLabel: body.pageLabel ?? "",
      pageCover: body.pageCover ?? "",
      createTime: nowString(),
    });
    return ok(null);
  }

  const pageDeleteMatch = path.match(/^\/admin\/pages\/(\d+)$/);
  if (pageDeleteMatch && method === "DELETE") {
    const id = Number(pageDeleteMatch[1]);
    db.pages = db.pages.filter((p) => p.id !== id);
    return ok(null);
  }

  /* ---------------- 站点设置 ---------------- */
  if (path === "/admin/website/config" && method === "PUT") {
    const body = await readBody<{ config?: string | object }>(req);
    if (body.config == null) return fail("请提供站点配置", 40010);
    db.websiteConfig =
      typeof body.config === "string" ? body.config : JSON.stringify(body.config, null, 2);
    addLog("站点设置", "更新", "/admin/website/config", "PUT", "更新站点配置");
    return ok(null);
  }

  if (path === "/admin/about" && method === "GET") {
    return ok(db.about);
  }

  if (path === "/admin/about" && method === "PUT") {
    const body = await readBody<Record<string, unknown>>(req);
    if (!body.nickname) return fail("昵称不能为空", 40010);
    const merged: Record<string, unknown> = { ...db.about, ...body };
    for (const key of ["aboutPoints", "techStack", "achievements"]) {
      if (Array.isArray(merged[key])) merged[key] = JSON.stringify(merged[key]);
    }
    merged.updateTime = nowString();
    db.about = merged as typeof db.about;
    addLog("站点设置", "更新", "/admin/about", "PUT", "更新「关于我」");
    return ok(null);
  }

  /* ---------------- 操作日志 ---------------- */
  if (path === "/admin/operation/logs" && method === "GET") {
    const { current, size } = pageParams(url);
    const keyword = (url.searchParams.get("keywords") || "").toLowerCase();
    let list = [...db.logs];
    if (keyword) {
      list = list.filter(
        (l) =>
          l.module.toLowerCase().includes(keyword) ||
          l.description.toLowerCase().includes(keyword),
      );
    }
    return ok(pageOf(list, current, size));
  }

  if (path === "/admin/operation/logs" && method === "DELETE") {
    const ids = await readBody<number[]>(req);
    const list = Array.isArray(ids) ? ids : [];
    if (list.length === 0) {
      db.logs = [];
    } else {
      db.logs = db.logs.filter((l) => !list.includes(l.id));
    }
    addLog("操作日志", "删除", "/admin/operation/logs", "DELETE", "清理操作日志");
    return ok(null);
  }

  /* ---------------- 其余后台接口占位 ---------------- */
  if (path.startsWith("/admin/")) {
    if (method === "GET") return ok([]);
    return ok(null);
  }

  return notFound();
}

async function handlePublic(req: Request, url: URL, path: string): Promise<Response> {
  const method = req.method;

  if (path === "/health" && method === "GET") {
    return json({ status: "ok" });
  }

  /* ---------------- 认证 ---------------- */
  if (path === "/login" && method === "POST") {
    const body = await readBody<{ username?: string; password?: string }>(req);
    const username = body.username?.trim();
    if (!username || !body.password) return fail("请输入邮箱和密码", 40010);
    if (body.password !== ADMIN_PASSWORD) {
      return fail("邮箱或密码错误", 50000);
    }
    return ok({
      token: `mock-token-${Date.now()}`,
      userInfo: {
        userId: 1,
        nickname: "管理员",
        avatar: "/uploads/avatar-1.png",
        intro: "这是本地 mock 管理员",
        email: username,
        loginType: 1,
      },
    });
  }

  if (path === "/register" && method === "POST") {
    const body = await readBody<{ username?: string; password?: string; code?: string }>(req);
    if (!body.username || !body.password || !body.code) {
      return fail("注册失败，请检查输入", 40010);
    }
    return ok(null);
  }

  if (path === "/forgot-password" && method === "POST") {
    return ok(null);
  }

  if (path === "/users/code" && method === "GET") {
    return ok("123456");
  }

  if (path.startsWith("/users/") || path === "/chat") {
    if (!requireAuth(req)) return unauthorized();
    return ok(null);
  }

  /* ---------------- 文章 ---------------- */
  if (path === "/articles" && method === "GET") {
    const { current, size } = pageParams(url);
    const categoryId = url.searchParams.get("categoryId") ?? url.searchParams.get("category");
    const tagId = url.searchParams.get("tagId") ?? url.searchParams.get("tag");
    const keyword = (
      url.searchParams.get("keyword") ??
      url.searchParams.get("keywords") ??
      ""
    ).toLowerCase();

    let list = publicArticles();
    if (categoryId) list = list.filter((a) => a.categoryId === Number(categoryId));
    if (tagId) list = list.filter((a) => a.tagIds.includes(Number(tagId)));
    if (keyword) {
      list = list.filter(
        (a) =>
          a.articleTitle.toLowerCase().includes(keyword) ||
          a.articleContent.toLowerCase().includes(keyword),
      );
    }
    const page = pageOf(list, current, size);
    return ok({ ...page, records: page.records.map(toHomeArticle) });
  }

  if (path === "/articles/archives" && method === "GET") {
    const { current, size } = pageParams(url);
    const list = publicArticles();
    const page = pageOf(list, current, size);
    return ok({
      ...page,
      records: page.records.map((a) => ({
        id: a.id,
        articleTitle: a.articleTitle,
        createTime: a.createTime,
      })),
    });
  }

  if (path === "/articles/search" && method === "GET") {
    const keyword = (
      url.searchParams.get("keywords") ?? url.searchParams.get("keyword") ?? ""
    ).toLowerCase();
    const list = publicArticles().filter(
      (a) =>
        a.articleTitle.toLowerCase().includes(keyword) ||
        a.articleContent.toLowerCase().includes(keyword),
    );
    return ok(list.map(toHomeArticle));
  }

  if (path === "/articles/condition" && method === "GET") {
    const { current, size } = pageParams(url);
    const categoryId = url.searchParams.get("categoryId");
    const tagId = url.searchParams.get("tagId");
    const keyword = (
      url.searchParams.get("keyword") ?? url.searchParams.get("keywords") ?? ""
    ).toLowerCase();

    let list = publicArticles();
    if (categoryId) list = list.filter((a) => a.categoryId === Number(categoryId));
    if (tagId) list = list.filter((a) => a.tagIds.includes(Number(tagId)));
    if (keyword) {
      list = list.filter(
        (a) =>
          a.articleTitle.toLowerCase().includes(keyword) ||
          a.articleContent.toLowerCase().includes(keyword),
      );
    }
    const page = pageOf(list, current, size);
    return ok({ ...page, records: page.records.map(toHomeArticle) });
  }

  const likeMatch = path.match(/^\/articles\/(\d+)\/like$/);
  if (likeMatch && method === "POST") {
    if (!requireAuth(req)) return unauthorized();
    const id = Number(likeMatch[1]);
    const liked = likes.articles.has(id);
    if (liked) likes.articles.delete(id);
    else likes.articles.add(id);
    const article = db.articles.find((a) => a.id === id);
    if (article && !liked) article.viewCount += 1;
    return ok({ isLike: !liked });
  }

  const articleMatch = path.match(/^\/articles\/(\d+)$/);
  if (articleMatch && method === "GET") {
    const id = Number(articleMatch[1]);
    const article = db.articles.find((a) => a.id === id);
    if (!article || article.isDelete || article.status !== 1) {
      return fail("文章不存在", 40004);
    }
    article.viewCount += 1;
    return ok(toArticleDetail(article));
  }

  /* ---------------- 分类 / 标签 ---------------- */
  if (path === "/categories" && method === "GET") {
    return ok(
      db.categories.map((c) => ({
        id: c.id,
        categoryName: c.categoryName,
        articleCount: db.articles.filter(
          (a) => a.categoryId === c.id && !a.isDelete && a.status === 1,
        ).length,
      })),
    );
  }

  if (path === "/tags" && method === "GET") {
    return ok(
      db.tags.map((t) => ({
        id: t.id,
        tagName: t.tagName,
        articleCount: db.articles.filter(
          (a) => a.tagIds.includes(t.id) && !a.isDelete && a.status === 1,
        ).length,
      })),
    );
  }

  /* ---------------- 评论 ---------------- */
  if (path === "/comments" && method === "GET") {
    const { current, size } = pageParams(url);
    const topicId = Number(url.searchParams.get("topicId") || 1);
    const type = Number(url.searchParams.get("type") || 1);

    const all = db.comments.filter(
      (c) => !c.isDelete && c.isReview && c.type === type && c.articleId === topicId,
    );
    const roots = all
      .filter((c) => c.parentId == null)
      .sort((a, b) => b.id - a.id);

    const page = pageOf(roots, current, size);
    return ok({
      ...page,
      records: page.records.map((c) => ({
        id: c.id,
        userId: c.userId,
        nickname: c.nickname,
        avatar: c.avatar,
        commentContent: c.commentContent,
        likeCount: 0,
        createTime: c.createTime,
        replyCount: all.filter((r) => r.parentId === c.id).length,
        replyVOList: all
          .filter((r) => r.parentId === c.id)
          .sort((a, b) => a.id - b.id)
          .map((r) => ({
            id: r.id,
            parentId: r.parentId ?? 0,
            userId: r.userId,
            nickname: r.nickname,
            avatar: r.avatar,
            replyUserId: r.replyUserId,
            replyNickname: r.replyNickname,
            commentContent: r.commentContent,
            likeCount: 0,
            createTime: r.createTime,
          })),
      })),
    });
  }

  if (path === "/comments" && method === "POST") {
    if (!requireAuth(req)) return unauthorized();
    const body = await readBody<{
      topicId?: number;
      commentContent?: string;
      parentId?: number | null;
      type?: number;
    }>(req);
    if (!body.commentContent?.trim()) return fail("请输入评论内容", 40010);
    const comment: CommentRecord = {
      id: nextIds.comment++,
      userId: 1,
      nickname: "管理员",
      avatar: "/uploads/avatar-1.png",
      commentContent: body.commentContent,
      articleId: body.topicId ?? 1,
      parentId: body.parentId ?? null,
      replyUserId: null,
      replyNickname: "",
      type: body.type ?? 1,
      isReview: true,
      isDelete: false,
      createTime: nowString(),
    };
    db.comments.push(comment);
    return ok(null);
  }

  /* ---------------- 说说 ---------------- */
  if (path === "/talks" && method === "GET") {
    const { current, size } = pageParams(url);
    const list = db.talks
      .filter((t) => t.status === 1)
      .sort((a, b) => {
        if (a.isTop !== b.isTop) return a.isTop ? -1 : 1;
        return b.id - a.id;
      });
    const page = pageOf(list, current, size);
    return ok({
      ...page,
      records: page.records.map((t) => ({
        id: t.id,
        nickname: t.nickname,
        avatar: t.avatar,
        content: t.content,
        imgList: t.images ? t.images.split(",").filter(Boolean) : null,
        isTop: t.isTop,
        likeCount: t.likeCount,
        createTime: t.createTime,
      })),
    });
  }

  const talkLikeMatch = path.match(/^\/talks\/(\d+)\/like$/);
  if (talkLikeMatch && method === "POST") {
    if (!requireAuth(req)) return unauthorized();
    const id = Number(talkLikeMatch[1]);
    const talk = db.talks.find((t) => t.id === id);
    if (!talk) return fail("说说不存在", 40004);
    const liked = likes.talks.has(id);
    if (liked) {
      likes.talks.delete(id);
      talk.likeCount = Math.max(0, talk.likeCount - 1);
    } else {
      likes.talks.add(id);
      talk.likeCount += 1;
    }
    return ok({ isLike: !liked });
  }

  const talkMatch = path.match(/^\/talks\/(\d+)$/);
  if (talkMatch && method === "GET") {
    const talk = db.talks.find((t) => t.id === Number(talkMatch[1]));
    if (!talk || talk.status !== 1) return fail("说说不存在", 40004);
    return ok({
      id: talk.id,
      nickname: talk.nickname,
      avatar: talk.avatar,
      content: talk.content,
      imgList: talk.images ? talk.images.split(",").filter(Boolean) : null,
      isTop: talk.isTop,
      likeCount: talk.likeCount,
      createTime: talk.createTime,
    });
  }

  /* ---------------- 友链 ---------------- */
  if (path === "/links" && method === "GET") {
    return ok(db.links);
  }

  /* ---------------- 留言 ---------------- */
  if (path === "/messages" && method === "GET") {
    // 前端按顶层数组消费（message/page.tsx）
    const list = db.messages
      .filter((m) => m.isReview)
      .sort((a, b) => b.id - a.id)
      .map((m) => ({
        id: m.id,
        nickname: m.nickname,
        avatar: m.avatar,
        messageContent: m.messageContent,
        createTime: m.createTime,
      }));
    return ok(list);
  }

  if (path === "/messages" && method === "POST") {
    const body = await readBody<{
      nickname?: string;
      avatar?: string;
      messageContent?: string;
    }>(req);
    if (!body.nickname?.trim() || !body.messageContent?.trim()) {
      return fail("请填写昵称和留言内容", 40010);
    }
    const message: MessageRecord = {
      id: nextIds.message++,
      nickname: body.nickname.trim(),
      avatar: body.avatar?.trim() || "/uploads/avatar-2.png",
      messageContent: body.messageContent.trim(),
      time: 5,
      isReview: true,
      createTime: nowString(),
    };
    db.messages.push(message);
    return ok(null);
  }

  /* ---------------- 站点配置 / 关于 ---------------- */
  if (path === "/website/config" && method === "GET") {
    return ok(db.websiteConfig);
  }

  if (path === "/about" && method === "GET") {
    return ok(db.about);
  }

  return notFound();
}

/* -------------------------------------------------------------------------- */
/* 服务器                                                                      */
/* -------------------------------------------------------------------------- */

function normalizePath(pathname: string): string {
  let path = pathname;
  if (path === "/api/v1" || path.startsWith("/api/v1/")) path = path.slice(7);
  else if (path === "/api" || path.startsWith("/api/")) path = path.slice(4);
  return path || "/";
}

const server = Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (pathname.startsWith("/uploads/")) {
      return serveImage(pathname);
    }

    const path = normalizePath(pathname);
    const isAdmin = path === "/admin" || path.startsWith("/admin/");

    try {
      if (isAdmin && !requireAuth(req)) return unauthorized();
      if (isAdmin) return await handleAdmin(req, url, path);
      return await handlePublic(req, url, path);
    } catch (err) {
      console.error(`[mock] ${req.method} ${pathname} 处理失败:`, err);
      return fail(err instanceof Error ? err.message : "服务器内部错误", 50000);
    }
  },
  error(err) {
    console.error("[mock] 未捕获错误:", err);
    return fail("服务器内部错误", 50000);
  },
});

console.log(`
  🌙 Moon Blog Mock API 已启动
  → http://localhost:${server.port}

  登录：任意邮箱 + 密码 ${ADMIN_PASSWORD}
  数据：内存存储，重启后重置
`);
