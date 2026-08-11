import { Activity, BarChart3, FileText, FolderTree } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SiteInfoWidgetProps {
  totalArticles: number;
  totalCategories: number;
  totalTags: number;
  runningDays: number;
}

export function SiteInfoWidget({
  totalArticles,
  totalCategories,
  totalTags,
  runningDays,
}: SiteInfoWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          站点信息
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat icon={FileText} label="文章" value={totalArticles} />
          <Stat icon={FolderTree} label="分类" value={totalCategories} />
          <Stat icon={Activity} label="标签" value={totalTags} />
          <Stat icon={Activity} label="运行天数" value={runningDays} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
