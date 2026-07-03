"use client";

import {
  SceneShell,
  SceneIntro,
  SceneBand,
  Stagger,
  StaggerItem,
} from "@/components/blocks/scene-shell";
import { Tappable } from "@/components/blocks/tappable";
import { SceneImage } from "@/components/blocks/scene-image";
import type { ScenePartInput } from "./types";

type Sections = NonNullable<ScenePartInput<"canvas">>["sections"];
type Section = NonNullable<NonNullable<Sections>[number]>;
type Item = NonNullable<NonNullable<Section["items"]>[number]>;

/**
 * The model-composed scene: an ordered list of typed sections, each
 * rendered by a small dedicated block. The model is the designer here  - 
 * this component just gives every section kind a high-quality rendering
 * and keeps the band rhythm (alternating tones) consistent.
 */
export function CanvasScene({ input }: { input: ScenePartInput<"canvas"> }) {
  const sections = (input?.sections?.filter(Boolean) ?? []) as Section[];
  // Hero paints its own full-bleed band; alternate tones across the rest.
  let bandIndex = 0;
  return (
    <SceneShell>
      <SceneIntro text={input?.intro} />
      {sections.map((section, i) => {
        if (section.kind === "hero") {
          return <HeroSection key={i} section={section} />;
        }
        const tone = bandIndex++ % 2 === 1 ? "muted" : "plain";
        return (
          <SceneBand key={i} tone={tone}>
            {section.title && section.kind !== "quote" && (
              <h2 className="mb-5 text-lg font-bold tracking-tight text-foreground">
                {section.title}
              </h2>
            )}
            <SectionBody section={section} />
          </SceneBand>
        );
      })}
    </SceneShell>
  );
}

function SectionBody({ section }: { section: Section }) {
  const items = (section.items?.filter(Boolean) ?? []) as Item[];
  switch (section.kind) {
    case "prose":
      return (
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          {section.body}
        </p>
      );

    case "bullets":
      return (
        <Stagger className="space-y-3">
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <Tappable
                ask={item.ask}
                className="flex w-full items-start gap-3"
              >
                <span className="text-xl leading-7" aria-hidden>
                  {item.emoji ?? "•"}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] leading-7 text-foreground">
                    {item.title && (
                      <span className="font-semibold">{item.title} </span>
                    )}
                    <span
                      className={
                        item.title ? "text-muted-foreground" : undefined
                      }
                    >
                      {item.detail}
                    </span>
                  </p>
                </div>
              </Tappable>
            </StaggerItem>
          ))}
        </Stagger>
      );

    case "stats":
      return (
        <Stagger className="mx-auto grid w-fit grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3">
          {items.map((item, i) => (
            <StaggerItem key={i} className="text-center">
              <p className="text-lg font-bold tracking-tight text-foreground">
                {item.value ?? item.title}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      );

    case "cards":
      return (
        <Stagger className="grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <StaggerItem key={i} className="h-full">
              <Tappable
                ask={item.ask}
                className="flex h-full w-full items-start gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/60 transition-shadow duration-150 group-hover:shadow-md"
              >
                <SceneImage
                  query={item.imageQuery}
                  emoji={item.emoji}
                  className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-3xl"
                />
                <div className="min-w-0">
                  {item.label && (
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                  )}
                  <p className="text-sm font-bold text-foreground group-hover:underline">
                    {item.title}
                  </p>
                  {item.detail && (
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                      {item.detail}
                    </p>
                  )}
                </div>
              </Tappable>
            </StaggerItem>
          ))}
        </Stagger>
      );

    case "steps":
      return (
        <Stagger className="space-y-4">
          {items.map((item, i) => (
            <StaggerItem key={i} className="flex items-start gap-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                {i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-bold text-foreground">
                  {item.title}
                </p>
                {item.detail && (
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      );

    case "timeline":
      return (
        <Stagger className="relative space-y-6 border-l border-border/70 pl-6">
          {items.map((item, i) => (
            <StaggerItem key={i} className="relative">
              <span className="absolute -left-[1.83rem] top-1.5 size-2.5 rounded-full bg-foreground ring-4 ring-background" />
              {item.label && (
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
              )}
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {item.emoji && (
                  <span className="mr-1.5" aria-hidden>
                    {item.emoji}
                  </span>
                )}
                {item.title}
              </p>
              {item.detail && (
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              )}
            </StaggerItem>
          ))}
        </Stagger>
      );

    case "gallery":
      return (
        <Stagger className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <Tappable ask={item.ask} className="w-full">
                <SceneImage
                  query={item.imageQuery}
                  emoji={item.emoji}
                  className="mb-2 flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted text-5xl transition-transform duration-150 ease-out-strong group-hover:scale-[1.02] group-active:scale-[0.98]"
                />
                <p className="text-sm font-bold text-foreground group-hover:underline">
                  {item.title}
                </p>
                {item.detail && (
                  <p className="text-xs leading-snug text-muted-foreground">
                    {item.detail}
                  </p>
                )}
              </Tappable>
            </StaggerItem>
          ))}
        </Stagger>
      );

    case "quote":
      return (
        <figure className="mx-auto max-w-md text-center">
          <blockquote className="text-xl font-semibold leading-snug tracking-tight text-foreground">
            &ldquo;{section.body ?? section.title}&rdquo;
          </blockquote>
          {items[0]?.label && (
            <figcaption className="mt-3 text-sm text-muted-foreground">
              - {items[0].label}
            </figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}

function HeroSection({ section }: { section: Section }) {
  return (
    <div className="mt-4 flex w-full flex-col items-center bg-muted/60 px-6 pb-10 pt-12 text-center">
      <SceneImage
        query={section.imageQuery}
        emoji={section.emoji}
        className="mb-4 flex h-48 w-full max-w-sm items-center justify-center rounded-3xl bg-muted text-7xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_16px_40px_-20px_rgba(0,0,0,0.25)]"
      />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {section.title}
      </h1>
      {section.body && (
        <p className="mt-2 max-w-md text-balance text-sm text-muted-foreground">
          {section.body}
        </p>
      )}
    </div>
  );
}
