import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MainGrid } from "@/components/layout/main-grid";
import { HomeSidebar } from "@/components/sidebar/home-sidebar";
import { siteConfig } from "@/config/site";

export default function AboutPage() {
  return (
    <MainGrid sidebar={<HomeSidebar />}>
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 shadow">
              <AvatarImage src={siteConfig.author.avatar} alt={siteConfig.author.name} />
              <AvatarFallback>{siteConfig.author.name[0]}</AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              {siteConfig.author.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {siteConfig.author.handle}
            </p>
          </div>
          <div className="prose prose-slate mx-auto mt-8 max-w-2xl dark:prose-invert">
            <p>{siteConfig.author.bio}</p>
            <h2>关于这个博客</h2>
            <p>
              Moon 是一个用 Next.js + Go 写的个人博客，记录我日常的折腾、想法与代码片段。
              设计上偏向手绘和夜空意象，希望能让你在阅读时也有一丝安静。
            </p>
            <h2>技术栈</h2>
            <ul>
              <li>前端：Next.js (App Router) · React 19 · Tailwind v4</li>
              <li>后端：Go · Gin · PostgreSQL · Redis</li>
              <li>部署：Docker · Nginx</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </MainGrid>
  );
}