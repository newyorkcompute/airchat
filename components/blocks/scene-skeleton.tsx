import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shimmer placeholder shown while a scene's data is still streaming in.
 *
 * Always at least viewport height (minus the sticky prompt bar): the
 * loading turn must be able to take over the whole screen, otherwise the
 * auto-scroll clamps at the document bottom and the previous turn's
 * prompt bar stays stuck in view.
 */
export function SceneSkeleton() {
  return (
    // Faster pulse than the 2s default — quicker loading indicators make
    // the wait feel shorter (perceived performance).
    <div className="mx-auto min-h-[calc(100dvh-3.5rem)] w-full max-w-2xl space-y-6 px-6 pt-10 [&_[data-slot=skeleton]]:[animation-duration:1.2s]">
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
