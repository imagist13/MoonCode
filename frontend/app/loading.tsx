import { Skeleton } from "@/components/ui/skeleton";

/** 根 loading 骨架屏。 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-16 w-3/4" />
      <Skeleton className="mt-4 h-16 w-2/3" />
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-52 w-full" />
        ))}
      </div>
    </div>
  );
}
