import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** 后台仪表盘统计卡片。 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-serif text-4xl italic tracking-tight">
            {value}
          </div>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-full border border-border/60 p-2 text-muted-foreground">
            <Icon className="size-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
