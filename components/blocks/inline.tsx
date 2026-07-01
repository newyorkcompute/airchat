import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ rating }: { rating?: number }) {
  if (rating == null) return null;
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
      {rating.toFixed(1)}
      <Star className="size-3.5 fill-foreground" aria-hidden />
    </span>
  );
}

export function PriceLevel({ level }: { level?: number }) {
  if (level == null) return null;
  return (
    <span className="text-sm font-medium tracking-wide text-muted-foreground">
      {"$".repeat(Math.max(1, Math.min(4, Math.round(level))))}
    </span>
  );
}

export function TagPills({
  tags,
  className,
}: {
  tags?: (string | undefined)[];
  className?: string;
}) {
  const clean = tags?.filter(Boolean) as string[] | undefined;
  if (!clean?.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {clean.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/** Dot-separated meta line, e.g. "4.7 · Japanese · Fore St". */
export function MetaLine({
  parts,
  className,
}: {
  parts: React.ReactNode[];
  className?: string;
}) {
  const clean = parts.filter(
    (p) => p !== null && p !== undefined && p !== ""
  );
  if (!clean.length) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-2 text-sm text-muted-foreground",
        className
      )}
    >
      {clean.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          {i > 0 && <span aria-hidden>·</span>}
          {part}
        </span>
      ))}
    </div>
  );
}
