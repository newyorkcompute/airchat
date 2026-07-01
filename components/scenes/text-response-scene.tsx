"use client";

import {
  SceneShell,
  SceneIntro,
  SceneBand,
  Stagger,
  StaggerItem,
} from "@/components/blocks/scene-shell";
import type { ScenePartInput } from "./types";

export function TextResponseScene({
  input,
}: {
  input: ScenePartInput<"textResponse">;
}) {
  const bullets = input?.bullets?.filter(Boolean) ?? [];
  return (
    <SceneShell>
      <SceneIntro text={input?.intro} />
      <SceneBand>
        {input?.heading && (
          <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">
            {input.heading}
          </h2>
        )}
        {input?.body && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {input.body}
          </p>
        )}
        {bullets.length > 0 && (
          <Stagger className="mt-6 space-y-3">
            {bullets.map((b, i) => (
              <StaggerItem
                key={i}
                className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4"
              >
                <span className="text-xl" aria-hidden>
                  {b?.emoji ?? "•"}
                </span>
                <p className="pt-0.5 text-sm leading-snug text-foreground">
                  {b?.text}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </SceneBand>
    </SceneShell>
  );
}
