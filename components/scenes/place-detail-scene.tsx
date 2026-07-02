"use client";

import {
  SceneShell,
  SceneIntro,
  SceneBand,
  Stagger,
  StaggerItem,
} from "@/components/blocks/scene-shell";
import { RatingStars, PriceLevel, TagPills, MetaLine } from "@/components/blocks/inline";
import { SceneImage } from "@/components/blocks/scene-image";
import type { ScenePartInput } from "./types";

export function PlaceDetailScene({
  input,
}: {
  input: ScenePartInput<"placeDetail">;
}) {
  const highlights = input?.highlights?.filter(Boolean) ?? [];
  return (
    <SceneShell>
      <SceneIntro text={input?.intro} />

      {/* Hero band */}
      <div className="mt-4 flex w-full flex-col items-center bg-muted/60 px-6 pb-10 pt-12 text-center">
        <SceneImage
          query={input?.imageQuery}
          emoji={input?.emoji}
          fallback="📍"
          className="mb-4 flex h-48 w-full max-w-sm items-center justify-center rounded-3xl bg-muted text-7xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_16px_40px_-20px_rgba(0,0,0,0.25)]"
        />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {input?.name}
        </h1>
        <MetaLine
          className="mt-2"
          parts={[
            input?.rating != null ? (
              <RatingStars rating={input.rating} />
            ) : null,
            input?.category,
            input?.location,
            input?.priceLevel != null ? (
              <PriceLevel level={input.priceLevel} />
            ) : null,
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
