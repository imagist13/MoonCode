import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { readServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await readServerSession();
  if (!session) redirect("/login?redirect=/admin");

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-0">
      <AdminSidebar />
      <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}