import { Skeleton } from "@/components/ui/skeleton";

/** Shimmer placeholder shown while a scene's data is still streaming in. */
export function SceneSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-6 pt-10">
      <div className="space-y-2">
        <Skeleton className="h-7 w-4/5 rounded-lg" />
        <Skeleton className="h-7 w-3/5 rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4">
        <Skeleton className="aspect-square rounded-2xl" />
        <Skeleton className="aspect-square rounded-2xl" />
        <Skeleton className="aspect-square rounded-2xl" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
