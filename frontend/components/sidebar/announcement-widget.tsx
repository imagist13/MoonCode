import { Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export function AnnouncementWidget() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-moon" />
      <div className="flex gap-3 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Megaphone className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            公告
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            {siteConfig.announcement}
          </p>
        </div>
      </div>
    </Card>
  );
}
