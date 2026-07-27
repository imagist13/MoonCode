import { AdminSidebar } from "@/components/layout/admin-sidebar";

/** 后台布局：Sidebar + 主内容区。 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
