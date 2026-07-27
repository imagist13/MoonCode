import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.description,
};

/** 关于页 —— 静态内容。 */
export default function AboutPage() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert">
      <div className="label-mono not-prose text-muted-foreground">Colophon</div>
      <h1 className="not-prose mt-3 text-4xl tracking-tight md:text-5xl">
        <span className="display-serif">About</span> {siteConfig.name}
      </h1>

      <p className="not-prose mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Moon 是一个记录工程思考与工艺细节的写作栖息地。这里没有营销的喧嚣，
        只有节奏、字体与代码。
      </p>

      <section className="mt-12">
        <h2 className="text-2xl tracking-tight">Stack</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>· Next.js 16 · React 19 · TypeScript 5</li>
          <li>· Tailwind CSS v4 · shadcn/ui 风格组件</li>
          <li>· Go · Gin · GORM （后端 · REST API）</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl tracking-tight">Contact</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          <a href={`mailto:${siteConfig.social.email}`}>
            {siteConfig.social.email}
          </a>
        </p>
      </section>
    </article>
  );
}
