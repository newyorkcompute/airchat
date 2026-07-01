"use client";

import {
  SceneShell,
  SceneIntro,
  SceneBand,
  Stagger,
} from "@/components/blocks/scene-shell";
import { SectionHeader } from "@/components/blocks/section-header";
import { StatCompareRow } from "@/components/blocks/stat-compare-row";
import { useSceneActions } from "@/components/chat/scene-context";
import type { ScenePartInput } from "./types";

function ItemHeader({
  emoji,
  name,
  subtitle,
}: {
  emoji?: string;
  name?: string;
  subtitle?: string;
}) {
  const { ask } = useSceneActions();
  return (
    <button
      type="button"
      disabled={!name}
      onClick={() => name && ask(`Tell me more about the ${name}`)}
      className="group flex flex-col items-center gap-2 text-center"
    >
      <div
        className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-muted text-6xl transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]"
        aria-hidden
      >
        {emoji ?? "⭐"}
      </div>
      <div>
        <p className="text-base font-bold text-foreground group-hover:underline">
          {name}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </button>
  );
}

export function ComparisonScene({
  input,
}: {
  input: ScenePartInput<"comparison">;
}) {
  const sections = input?.sections?.filter(Boolean) ?? [];
  return (
    <SceneShell>
      <SceneIntro text={input?.intro} />

      {/* Sticky contender header, pinned just below the prompt bar */}
      <div className="sticky top-14 z-10 mx-auto w-full max-w-2xl px-4 pt-4">
        <div className="grid grid-cols-2 gap-6 rounded-3xl bg-card/95 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_16px_40px_-20px_rgba(0,0,0,0.25)] ring-1 ring-border/60 backdrop-blur">
          <ItemHeader {...input?.itemA} />
          <ItemHeader {...input?.itemB} />
        </div>
      </div>

      <div className="pt-6">
        {sections.map((section, i) => (
          <SceneBand key={i} tone={i % 2 === 1 ? "muted" : "plain"}>
            <SectionHeader emoji={section?.emoji} title={section?.title} />
            <Stagger className="divide-y divide-border/60">
              {(section?.rows?.filter(Boolean) ?? []).map((row, j) => (
                <StatCompareRow
                  key={j}
                  valueA={row?.valueA}
                  valueB={row?.valueB}
                  better={row?.better}
                  note={row?.note}
                />
              ))}
            </Stagger>
          </SceneBand>
        ))}
      </div>

      {input?.verdict && (
        <SceneBand>
          <p className="mx-auto max-w-md text-center text-lg font-semibold leading-snug text-foreground">
            {input.verdict}
          </p>
        </SceneBand>
      )}
    </SceneShell>
  );
}
