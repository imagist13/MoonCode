import { api } from "@/lib/api";

/** About Me 区域的一个要点（emoji + 文本） */
export interface AboutPoint {
  emoji: string;
  text: string;
}

/** 技术栈 / 成就的徽章项（图标 emoji + 颜色 + 名称） */
export interface AboutBadge {
  name: string;
  icon: string;
  color: string;
}

/** 完整的「关于我」配置，由后端 /about 返回 */
export interface AboutInfo {
  id?: number;
  banner: string;
  avatar: string;
  nickname: string;
  pronouns: string;
  intro: string;
  subtitle: string;
  bio: string;
  aboutPoints: AboutPoint[];
  email: string;
  website: string;
  github: string;
  followers: number;
  following: number;
  techStack: AboutBadge[];
  backendSkills: string;
  frontendSkills: string;
  otherSkills: string;
  achievements: AboutBadge[];
}

/**
 * 后端在 JSON 数组型字段上空值会返回 "[]"（字符串），与 AboutInfo 期望的数组不匹配。
 * 这里统一在「读」路径上把字符串安全地转成数组，避免前端拿到结构断裂的数据。
 */
function ensureArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string" && value) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export async function getAbout(): Promise<AboutInfo> {
  const res = await api.get<Record<string, unknown>>("/about");
  const data = (res.data ?? {}) as Record<string, unknown>;
  return {
    banner: typeof data.banner === "string" ? data.banner : "",
    avatar: typeof data.avatar === "string" ? data.avatar : "",
    nickname: typeof data.nickname === "string" ? data.nickname : "",
    pronouns: typeof data.pronouns === "string" ? data.pronouns : "",
    intro: typeof data.intro === "string" ? data.intro : "",
    subtitle: typeof data.subtitle === "string" ? data.subtitle : "",
    bio: typeof data.bio === "string" ? data.bio : "",
    aboutPoints: ensureArray<AboutPoint>(data.aboutPoints, []),
    email: typeof data.email === "string" ? data.email : "",
    website: typeof data.website === "string" ? data.website : "",
    github: typeof data.github === "string" ? data.github : "",
    followers: typeof data.followers === "number" ? data.followers : 0,
    following: typeof data.following === "number" ? data.following : 0,
    techStack: ensureArray<AboutBadge>(data.techStack, []),
    backendSkills: typeof data.backendSkills === "string" ? data.backendSkills : "",
    frontendSkills: typeof data.frontendSkills === "string" ? data.frontendSkills : "",
    otherSkills: typeof data.otherSkills === "string" ? data.otherSkills : "",
    achievements: ensureArray<AboutBadge>(data.achievements, []),
  };
}

export async function updateAbout(payload: AboutInfo): Promise<void> {
  // 把数组再序列化为 JSON 字符串，与后端 model 字段类型保持一致
  const body = {
    ...payload,
    aboutPoints: JSON.stringify(payload.aboutPoints ?? []),
    techStack: JSON.stringify(payload.techStack ?? []),
    achievements: JSON.stringify(payload.achievements ?? []),
  };
  const res = await api.put("/admin/about", body);
  if (!res.flag) {
    throw new Error(res.message || "保存失败");
  }
}

/** 上传图片，返回可访问的 URL。复用现有 admin 图片上传接口 */
export async function uploadImage(file: File): Promise<string> {
  const res = await api.upload<string>("/admin/articles/images", file);
  if (!res.flag || !res.data) {
    throw new Error(res.message || "上传失败");
  }
  return res.data;
}