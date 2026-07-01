"use client";

import { Clock, Users, Gauge } from "lucide-react";
import {
  SceneShell,
  SceneIntro,
  SceneBand,
  Stagger,
} from "@/components/blocks/scene-shell";
import { MediaTile } from "@/components/blocks/media-tile";
import { StepTimeline } from "@/components/blocks/step-timeline";
import type { ScenePartInput } from "./types";

export function RecipeScene({ input }: { input: ScenePartInput<"recipe"> }) {
  const ingredients = input?.ingredients?.filter(Boolean) ?? [];
  const steps = input?.steps?.filter(Boolean) ?? [];

  return (
    <SceneShell>
      <SceneIntro text={input?.intro} />

      {input?.meta && (
        <div className="mx-auto flex w-full max-w-2xl items-center gap-5 px-6 pb-2 text-sm text-muted-foreground">
          {input.meta.time && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {input.meta.time}
            </span>
          )}
          {input.meta.servings && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" aria-hidden /> {input.meta.servings}
            </span>
          )}
          {input.meta.difficulty && (
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="size-4" aria-hidden /> {input.meta.difficulty}
            </span>
          )}
        </div>
      )}

      <SceneBand>
        <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground">
          What you need
        </h2>
        <Stagger className="grid grid-cols-3 gap-x-4 gap-y-6">
          {ingredients.map((ing, i) => (
            <MediaTile
              key={i}
              emoji={ing?.emoji}
              title={ing?.name}
              subtitle={ing?.amount}
            />
          ))}
        </Stagger>
      </SceneBand>

      {steps.length > 0 && (
        <SceneBand tone="muted">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground">
            Make it step by step
          </h2>
          <StepTimeline steps={steps} />
        </SceneBand>
      )}
    </SceneShell>
  );
}
