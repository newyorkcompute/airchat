"use client";

import { StaggerItem } from "./scene-shell";
import { cn } from "@/lib/utils";

function Annotation({
  text,
  kind,
}: {
  text?: string;
  kind: "good" | "bad" | "none";
}) {
  return (
    <div className="mt-1.5 flex h-5 items-center justify-center">
      {kind === "none" || !text ? (
        <span className="text-muted-foreground/50" aria-hidden>
          —
        </span>
      ) : (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none",
            kind === "good"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * One comparison row: two stat values side by side with a green (winner)
 * or red (loser) annotation under each, like the Lucid vs Tesla screen.
 */
export function StatCompareRow({
  valueA,
  valueB,
  better,
  note,
}: {
  valueA?: string;
  valueB?: string;
  better?: "a" | "b" | "tie";
  note?: string;
}) {
  return (
    <StaggerItem className="grid grid-cols-2">
      <div className="border-r border-border/70 px-3 py-4 text-center">
        <p className="text-sm font-semibold text-foreground">{valueA}</p>
        <Annotation
          text={note}
          kind={better === "a" ? "good" : better === "b" ? "bad" : "none"}
        />
      </div>
      <div className="px-3 py-4 text-center">
        <p className="text-sm font-semibold text-foreground">{valueB}</p>
        <Annotation
          text={note}
          kind={better === "b" ? "good" : better === "a" ? "bad" : "none"}
        />
      </div>
    </StaggerItem>
  );
}
