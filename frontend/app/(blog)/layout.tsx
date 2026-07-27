import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

/** 博客域布局：Header + Footer。 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">{children}</main>
      <SiteFooter />
    </>
  );
}
