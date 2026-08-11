export const siteConfig = {
  name: "Moon",
  title: "Moon · 月下博客",
  description: "记录、思考与代码——在月光下，慢一点写。",
  author: {
    name: "Moon",
    handle: "@moon",
    bio: "Frontend / Backend · Stay curious.",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=moon",
  },
  social: [
    { name: "GitHub", href: "https://github.com/" },
    { name: "X", href: "https://x.com/" },
    { name: "RSS", href: "/rss.xml" },
  ],
  announcement:
    "🌙 主题切换已上线：把月亮挂到顶栏，月下写，月下读。",
  url: "http://localhost:3000",
} as const;
