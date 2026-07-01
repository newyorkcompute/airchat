"use client";

import {
  SceneShell,
  SceneIntro,
  SceneBand,
  Stagger,
  StaggerItem,
} from "@/components/blocks/scene-shell";
import { TagPills } from "@/components/blocks/inline";
import { useSceneActions } from "@/components/chat/scene-context";
import type { ScenePartInput } from "./types";

export function MediaGridScene({
  input,
}: {
  input: ScenePartInput<"mediaGrid">;
}) {
  const { ask } = useSceneActions();
  const sections = input?.sections?.filter(Boolean) ?? [];
  return (
    <SceneShell>
      <SceneIntro text={input?.intro} />
      {sections.map((section, i) => (
        <SceneBand key={i} tone={i % 2 === 1 ? "muted" : "plain"}>
          <h2 className="mb-5 text-lg font-bold tracking-tight text-foreground">
            {section?.title}
          </h2>
          <Stagger className="grid grid-cols-2 gap-x-4 gap-y-6">
            {(section?.items?.filter(Boolean) ?? []).map((item, j) => (
              <StaggerItem key={j}>
                <button
                  type="button"
                  disabled={!item?.title}
                  onClick={() =>
                    item?.title && ask(`Tell me more about ${item.title}`)
                  }
                  className="group w-full text-left"
                >
                  <div
                    className="mb-2.5 flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted text-6xl transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]"
                    aria-hidden
                  >
                    {item?.emoji ?? "🎬"}
                  </div>
                  <p className="text-sm font-bold text-foreground group-hover:underline">
                    {item?.title}
                  </p>
                  {item?.subtitle && (
                    <p className="text-xs leading-snug text-muted-foreground">
                      {item.subtitle}
                    </p>
                  )}
                  <TagPills
                    tags={item?.tags?.filter(Boolean) as string[] | undefined}
                    className="mt-1.5"
                  />
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </SceneBand>
      ))}
    </SceneShell>
  );
}
