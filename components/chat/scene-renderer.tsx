"use client";

import { AnimatePresence, motion } from "motion/react";
import type { AirchatUIMessage } from "@/lib/ai/tools";
import { SceneSkeleton } from "@/components/blocks/scene-skeleton";
import { EASE_OUT } from "@/components/blocks/scene-shell";
import { RestaurantListScene } from "@/components/scenes/restaurant-list-scene";
import { PlaceDetailScene } from "@/components/scenes/place-detail-scene";
import { ComparisonScene } from "@/components/scenes/comparison-scene";
import { RecipeScene } from "@/components/scenes/recipe-scene";
import { MediaGridScene } from "@/components/scenes/media-grid-scene";
import { ItemDetailScene } from "@/components/scenes/item-detail-scene";
import { TextResponseScene } from "@/components/scenes/text-response-scene";

type Part = AirchatUIMessage["parts"][number];

/**
 * Renders one assistant message as its scene. The scene renders from the
 * tool call's (possibly still streaming, partial) input.
 */
export function SceneRenderer({ message }: { message: AirchatUIMessage }) {
  return (
    <>
      {message.parts.map((part, index) => (
        <ScenePart key={index} part={part} />
      ))}
    </>
  );
}

function ScenePart({ part }: { part: Part }) {
  if (!part.type.startsWith("tool-")) return null;

  // Shimmer until any input has streamed in. `popLayout` lifts the
  // exiting skeleton out of the flow so the scene takes its place
  // immediately and the shimmer fades out *on top* of it — the swap
  // reads as the skeleton resolving into content, not a hard cut.
  const showSkeleton =
    !("input" in part) ||
    part.input == null ||
    (part.state === "input-streaming" &&
      Object.keys(part.input as object).length === 0);

  return (
    <div className="relative">
      <AnimatePresence mode="popLayout" initial={false}>
        {showSkeleton ? (
          <motion.div
            key="skeleton"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="relative z-10 w-full bg-background"
          >
            <SceneSkeleton />
          </motion.div>
        ) : (
          <motion.div key="scene" className="w-full">
            <SceneBody part={part} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SceneBody({ part }: { part: Part }) {
  // Re-narrow to tool parts for TypeScript; ScenePart already gates this.
  if (!("input" in part)) return null;

  if (part.state === "output-error") {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10 text-sm text-destructive">
        Something went wrong rendering this scene: {part.errorText}
      </div>
    );
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  switch (part.type) {
    case "tool-restaurantList":
      return <RestaurantListScene input={part.input as any} />;
    case "tool-placeDetail":
      return <PlaceDetailScene input={part.input as any} />;
    case "tool-comparison":
      return <ComparisonScene input={part.input as any} />;
    case "tool-recipe":
      return <RecipeScene input={part.input as any} />;
    case "tool-mediaGrid":
      return <MediaGridScene input={part.input as any} />;
    case "tool-itemDetail":
      return <ItemDetailScene input={part.input as any} />;
    case "tool-textResponse":
      return <TextResponseScene input={part.input as any} />;
    default:
      return null;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
