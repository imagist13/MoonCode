import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MainGrid } from "@/components/layout/main-grid";
import { HomeSidebar } from "@/components/sidebar/home-sidebar";
import { PostCard } from "@/components/post/post-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listArticles } from "@/lib/api/articles";
import { siteConfig } from "@/config/site";

export default async function HomePage() {
  const { items } = await listArticles({ page: 1, pageSize: 12 }).catch(
    () => ({ items: [] as never[] })
  );
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <MainGrid sidebar={<HomeSidebar />}>
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-sm">
          <div
            aria-hidden
            className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-moon/30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              月下写，月下读
            </span>
            <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {siteConfig.title}
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-base text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/articles" className={cn(buttonVariants())}>
                开始阅读 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                认识一下
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featured && (
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-semibold tracking-tight">置顶 · 最新</h2>
            <Link
              href="/articles"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
            >
              更多 <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <PostCard article={featured} />
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight">最新文章</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {rest.map((a) => (
              <PostCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            还没有文章，<Link href="/admin" className="text-primary hover:underline">去写一篇</Link>
            。
          </p>
        </div>
      )}
    </MainGrid>
  );
}