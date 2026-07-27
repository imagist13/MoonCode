import Link from "next/link";
import { siteConfig } from "@/config/site";

/** 认证域布局 —— 无 header/footer，聚焦表单。 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-10 flex items-baseline gap-2">
          <span className="font-serif text-2xl italic tracking-tight">
            {siteConfig.name}
          </span>
          <span className="label-mono text-muted-foreground">journal</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
