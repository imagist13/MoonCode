import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { articles } from "@/lib/api/articles";
import type { Article } from "@/types/article";
import { format } from "date-fns";

export const revalidate = 300;

/**
 * 首页 —— Hero + Latest + Values 三段式。
 * 使用 Playfair Display italic 强调词，JetBrains Mono 呈现细节标签。
 */
export default async function HomePage() {
  let latest: Article[] = [];
  try {
    const data = await articles.list({ pageSize: 3, status: 1 }, { revalidate: 300 });
    latest = data.list ?? [];
  } catch {
    // 后端未就绪时降级为空数组
  }

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="py-24 md:py-32">
          <div className="label-mono text-muted-foreground">
            Journal · 2026 —
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.02] tracking-tight md:text-7xl">
            Words that <span className="display-serif">breathe</span>, code that{" "}
            <span className="display-serif">whispers</span>.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Moon 是一个关于工程美学、系统设计与工艺细节的写作栖息地——
            以极简排版承载思考，以字体传递呼吸感。
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/articles">
                浏览文章 <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">关于 Moon</Link>
            </Button>
          </div>
        </section>

        {/* Latest */}
        <section className="border-t border-border/60 py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl tracking-tight">
              <span className="display-serif">Latest</span> writings
            </h2>
            <Link
              href="/articles"
              className="label-mono text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {(latest.length ? latest : mockLatest).map((a) => (
              <Card key={a.id} className="group h-full">
                <CardHeader>
                  <div className="label-mono text-muted-foreground">
                    {a.published_at || a.created_at
                      ? format(
                          new Date(
                            (a.published_at ?? a.created_at) as string
                          ),
                          "yyyy · MM · dd"
                        )
                      : "— · — · —"}
                  </div>
                  <CardTitle className="mt-3 text-lg leading-snug">
                    <Link
                      href={`/articles/${a.slug}`}
                      className="transition-colors group-hover:text-primary"
                    >
                      {a.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {a.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="grid gap-10 border-t border-border/60 py-16 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.n}>
              <div className="label-mono text-muted-foreground">{v.n}</div>
              <h3 className="mt-3 text-xl tracking-tight">
                <span className="display-serif">{v.emphasis}</span> {v.rest}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {v.desc}
              </p>
            </div>
          ))}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

/** 后端未就绪时的兜底数据，仅在首页首次加载时使用。 */
const mockLatest: Article[] = [
  {
    id: -1,
    title: "The shape of quiet systems",
    slug: "the-shape-of-quiet-systems",
    summary:
      "关于降低复杂度、让系统安静地为使用者服务的一次思考。",
    status: 1,
    reading_time: 8,
    created_at: new Date().toISOString(),
  },
  {
    id: -2,
    title: "Typography as an interface",
    slug: "typography-as-an-interface",
    summary:
      "字体是内容与读者之间的第一层界面——如何用字距、字号与节奏建立信任。",
    status: 1,
    reading_time: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: -3,
    title: "Notes on Go, HTTP and calm APIs",
    slug: "notes-on-go-http-and-calm-apis",
    summary: "写一个不喧闹的后端：错误码、契约与统一响应的思考。",
    status: 1,
    reading_time: 10,
    created_at: new Date().toISOString(),
  },
];

const values = [
  {
    n: "01",
    emphasis: "Quiet",
    rest: "as a first principle",
    desc: "克制的动效、克制的用色、克制的信息密度——只在必要时发出声音。",
  },
  {
    n: "02",
    emphasis: "Reading",
    rest: "comes before everything",
    desc: "文字优先渲染，动效不阻塞内容；行高、行距、字号服务阅读节奏。",
  },
  {
    n: "03",
    emphasis: "Craft",
    rest: "lives in the details",
    desc: "从字体加载到代码块的复制按钮，从暗色模式的边框到 kbd 装饰，皆有所思。",
  },
];
