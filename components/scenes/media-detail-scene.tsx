"use client";

import {
  SceneShell,
  SceneIntro,
  SceneBand,
  Stagger,
  StaggerItem,
} from "@/components/blocks/scene-shell";
import { RatingStars, TagPills, MetaLine } from "@/components/blocks/inline";
import type { ScenePartInput } from "./types";

export function MediaDetailScene({
  input,
}: {
  input: ScenePartInput<"mediaDetail">;
}) {
  const highlights = input?.highlights?.filter(Boolean) ?? [];
  return (
    <SceneShell>
      <SceneIntro text={input?.intro} />

      {/* Hero band */}
      <div className="mt-4 flex w-full flex-col items-center bg-muted/60 px-6 pb-10 pt-12 text-center">
        <span className="mb-4 text-7xl" aria-hidden>
          {input?.emoji ?? "🎬"}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {input?.title}
        </h1>
        <MetaLine
          className="mt-2"
          parts={[
            input?.rating != null ? (
              <RatingStars rating={input.rating} />
            ) : null,
            input?.subtitle,
          ]}
        />
      </div>

      <SceneBand>
        {input?.description && (
          <p className="mx-auto max-w-md text-center text-base leading-relaxed text-muted-foreground">
            {input.description}
          </p>
        )}
        <TagPills
          tags={input?.tags?.filter(Boolean) as string[] | undefined}
          className="mt-4 justify-center"
        />
      </SceneBand>

      {highlights.length > 0 && (
        <SceneBand tone="muted">
          <Stagger className="space-y-3">
            {highlights.map((h, i) => (
              <StaggerItem
                key={i}
                className="flex items-start gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/60"
              >
                <span className="text-2xl" aria-hidden>
                  {h?.emoji ?? "✨"}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {h?.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{h?.detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </SceneBand>
      )}
    </SceneShell>
  );
}
