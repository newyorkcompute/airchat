"use client";

import { StaggerItem } from "./scene-shell";
import { RatingStars, PriceLevel, TagPills } from "./inline";
import { useAskIntent } from "./tappable";
import { useSceneActions } from "@/components/chat/scene-context";

/**
 * List row for a place: emoji avatar, name/rating line, blurb, tags.
 * Tappable when `ask` is provided — sends it as the next turn (with
 * hover/touch prefetch), opening a detail scene.
 */
export function ItemRow({
  emoji,
  name,
  category,
  rating,
  priceLevel,
  blurb,
  tags,
  ask,
}: {
  emoji?: string;
  name?: string;
  category?: string;
  rating?: number;
  priceLevel?: number;
  blurb?: string;
  tags?: string[];
  ask?: string;
}) {
  const actions = useSceneActions();
  const intent = useAskIntent(ask);
  return (
    <StaggerItem
      className="flex cursor-pointer gap-4 rounded-2xl bg-card p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-border/60 transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
      onClick={ask ? () => actions.ask(ask) : undefined}
      role={ask ? "button" : undefined}
      {...intent}
    >
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-3xl"
        aria-hidden
      >
        {emoji ?? "📍"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-base font-bold text-foreground">
            {name}
          </p>
          <RatingStars rating={rating} />
        </div>
        <p className="text-xs text-muted-foreground">
          {category}
          {category && priceLevel != null && " · "}
          <PriceLevel level={priceLevel} />
        </p>
        {blurb && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
            {blurb}
          </p>
        )}
        <TagPills tags={tags} className="mt-2" />
      </div>
    </StaggerItem>
  );
}
