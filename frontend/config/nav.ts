import type { Route } from "next";

export interface NavItem {
  href: Route;
  label: string;
  description?: string;
}

export const mainNav: NavItem[] = [
  { href: "/", label: "首页", description: "Latest writings" },
  { href: "/articles", label: "归档", description: "All posts" },
  { href: "/categories", label: "分类", description: "Browse by category" },
  { href: "/tags", label: "标签", description: "Browse by tag" },
  { href: "/about", label: "关于", description: "About me" },
];
