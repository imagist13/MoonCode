import { Moon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Moon className="h-6 w-6 animate-pulse text-primary" />
      <p className="text-sm">月光加载中…</p>
    </div>
  );
}