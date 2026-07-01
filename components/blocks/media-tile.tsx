"use client";

import { StaggerItem } from "./scene-shell";

/**
 * Emoji-led visual tile: ingredient, movie, car, etc.
 * Big emoji on a soft neutral square, caption + sub-caption below.
 */
export function MediaTile({
  emoji,
  title,
  subtitle,
  size = "md",
}: {
  emoji?: string;
  title?: string;
  subtitle?: string;
  size?: "md" | "lg";
}) {
  return (
    <StaggerItem className="flex flex-col items-center gap-2 text-center">
      <div
        className={
          size === "lg"
            ? "flex aspect-square w-full items-center justify-center rounded-2xl bg-muted text-6xl"
            : "flex aspect-square w-full items-center justify-center rounded-2xl bg-muted text-5xl"
        }
        aria-hidden
      >
        {emoji ?? "✨"}
      </div>
      <div className="min-h-4">
        {title && (
          <p className="text-sm font-semibold text-foreground">{title}</p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </StaggerItem>
  );
}
