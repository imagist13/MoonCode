import { AnnouncementWidget } from "@/components/sidebar/announcement-widget";
import { CategoriesWidget } from "@/components/sidebar/categories-widget";
import { ProfileWidget } from "@/components/sidebar/profile-widget";
import { SiteInfoWidget } from "@/components/sidebar/site-info-widget";
import { TagsWidget } from "@/components/sidebar/tags-widget";
import { listCategories } from "@/lib/api/categories";
import { listTags } from "@/lib/api/tags";
import { listArticles } from "@/lib/api/articles";

// 服务端聚合：失败时静默 fallback，保证页面骨架始终完整
export async function HomeSidebar() {
  const [cats, tags, articles] = await Promise.allSettled([
    listCategories(),
    listTags(),
    listArticles({ pageSize: 1, page: 1 }),
  ]);

  const categories =
    cats.status === "fulfilled"
      ? cats.value.map((c) => ({ slug: c.slug, name: c.name, count: c.articleCount }))
      : [];
  const tagsList =
    tags.status === "fulfilled"
      ? tags.value.map((t) => ({ slug: t.slug, name: t.name, count: t.articleCount }))
      : [];
  const total =
    articles.status === "fulfilled" ? articles.value.total : categories.length * 3;
  const runningDays = Math.max(
    1,
    Math.floor((Date.now() - new Date("2024-01-01").getTime()) / 86_400_000)
  );

  return (
    <div className="space-y-6">
      <ProfileWidget />
      <AnnouncementWidget />
      <SiteInfoWidget
        totalArticles={total}
        totalCategories={categories.length}
        totalTags={tagsList.length}
        runningDays={runningDays}
      />
      <CategoriesWidget items={categories} />
      <TagsWidget items={tagsList} />
    </div>
  );
}