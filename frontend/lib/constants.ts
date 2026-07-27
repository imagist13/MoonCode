/**
 * 全局常量。
 */

/** 后端 API 基础路径（可通过环境变量覆盖）。 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api/v1";

/** 站点前台 URL（用于 SEO、canonical、sitemap）。 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** JWT 存储的 Cookie 名称。 */
export const TOKEN_COOKIE = "moon_token";

/** 主题存储的 localStorage 键。 */
export const THEME_STORAGE_KEY = "moon-theme";
