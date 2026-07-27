/** 站点级元信息，供 layout / SEO / footer 复用。 */
export const siteConfig = {
  name: "Moon",
  title: "Moon — 一位程序员的写作栖息地",
  description:
    "Moon 是一个关注工程美学、系统设计与工艺细节的博客。以极简排版承载思考，以字体传递呼吸感。",
  author: "Moon",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  keywords: ["博客", "编程", "工程", "设计", "Moon"],
  social: {
    github: "https://github.com/",
    email: "hello@moon.dev",
  },
} as const;

export type SiteConfig = typeof siteConfig;
