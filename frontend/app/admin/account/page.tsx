import { MainGrid } from "@/components/layout/main-grid";
import { Card, CardContent } from "@/components/ui/card";
import { readServerSession } from "@/lib/auth/session";
import { me } from "@/lib/api/users";
import { siteConfig } from "@/config/site";

export default async function AdminAccountPage() {
  const session = (await readServerSession())!;
  const user = await me(session.token).catch(() => null);

  return (
    <MainGrid>
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">账号</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            这是 {siteConfig.name} 管理员的基础资料。
          </p>
          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="用户名" value={user?.username ?? "—"} />
            <Field label="昵称" value={user?.nickname ?? "—"} />
            <Field label="邮箱" value={user?.email ?? "—"} />
            <Field label="角色" value={user?.role ?? "—"} />
          </dl>
          <p className="mt-6 text-xs text-muted-foreground">
            个人资料编辑功能将在后续迭代提供。当前展示来自后端的只读视图。
          </p>
        </CardContent>
      </Card>
    </MainGrid>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}