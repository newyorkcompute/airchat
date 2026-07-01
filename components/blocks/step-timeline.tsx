"use client";

import { Stagger, StaggerItem } from "./scene-shell";
import { cn } from "@/lib/utils";

type Step = { emoji?: string; title?: string; detail?: string };

/**
 * Numbered horizontal indicator + swipeable step cards,
 * like Monogram's "Bake it step by step".
 */
export function StepTimeline({ steps }: { steps?: Step[] }) {
  const clean = steps?.filter(Boolean) ?? [];
  if (!clean.length) return null;

  return (
    <div>
      <div className="mb-6 flex items-start px-2">
        {clean.map((step, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "h-px flex-1",
                  i === 0 ? "bg-transparent" : "bg-border"
                )}
              />
              <span
                className={cn(
                  "px-1 text-sm font-semibold tabular-nums",
                  i === 0 ? "text-foreground" : "text-muted-foreground/60"
                )}
              >
                {i + 1}
              </span>
              <div
                className={cn(
                  "h-px flex-1",
                  i === clean.length - 1 ? "bg-transparent" : "bg-border"
                )}
              />
            </div>
            <span
              className={cn("text-lg", i !== 0 && "opacity-40 grayscale")}
              aria-hidden
            >
              {step.emoji ?? "•"}
            </span>
          </div>
        ))}
      </div>

      <Stagger className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {clean.map((step, i) => (
          <StaggerItem
            key={i}
            className="w-64 shrink-0 snap-center rounded-3xl bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] ring-1 ring-border/60"
          >
            <div
              className="mb-4 flex h-28 items-center justify-center rounded-2xl bg-muted text-6xl"
              aria-hidden
            >
              {step.emoji ?? "🍳"}
            </div>
            <p className="text-sm font-bold text-foreground">
              <span className="mr-1.5 text-muted-foreground/70 tabular-nums">
                {i + 1}.
              </span>
              {step.title}
            </p>
            {step.detail && (
              <p className="mt-1 text-sm leading-snug text-muted-foreground">
                {step.detail}
              </p>
            )}
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
