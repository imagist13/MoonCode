import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

/** 账号页 —— 显示当前登录用户的资料。 */
export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { user } = session;
  const initials = (user.nickname || user.username || "M").slice(0, 1).toUpperCase();

  return (
    <div className="space-y-8">
      <header>
        <div className="label-mono text-muted-foreground">Account</div>
        <h1 className="mt-2 text-3xl tracking-tight">
          <span className="display-serif">Your</span> profile
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.username} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="text-lg font-medium">
              {user.nickname || user.username}
            </div>
            <div className="text-sm text-muted-foreground">
              @{user.username}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardContent className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">邮箱</span>
            <span>{user.email ?? "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">简介</span>
            <span className="max-w-md text-right">{user.bio ?? "-"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
