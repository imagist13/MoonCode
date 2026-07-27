import type { LucideIcon } from "lucide-react";
import { Home, Newspaper, Folder, Tag, User } from "lucide-react";

/** 主站顶部导航项。 */
export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "Categories", href: "/categories" },
  { label: "Tags", href: "/tags" },
  { label: "About", href: "/about" },
];

/** 后台侧栏项。 */
export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNav: AdminNavItem[] = [
  { label: "仪表盘", href: "/admin", icon: Home },
  { label: "写文章", href: "/admin/articles/new", icon: Newspaper },
  { label: "分类", href: "/admin", icon: Folder },
  { label: "标签", href: "/admin", icon: Tag },
  { label: "账号", href: "/admin/account", icon: User },
];
