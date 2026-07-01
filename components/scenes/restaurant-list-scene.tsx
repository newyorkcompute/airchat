"use client";

import { MapPin } from "lucide-react";
import {
  SceneShell,
  SceneIntro,
  SceneBand,
  Stagger,
} from "@/components/blocks/scene-shell";
import { ItemRow } from "@/components/blocks/item-row";
import { useSceneActions } from "@/components/chat/scene-context";
import type { ScenePartInput } from "./types";

export function RestaurantListScene({
  input,
}: {
  input: ScenePartInput<"restaurantList">;
}) {
  const { ask } = useSceneActions();
  const places = input?.places?.filter(Boolean) ?? [];
  return (
    <SceneShell>
      <SceneIntro text={input?.intro} />
      {input?.area && (
        <div className="mx-auto flex w-full max-w-2xl items-center gap-1.5 px-6 pb-4 text-sm text-muted-foreground">
          <MapPin className="size-4" aria-hidden />
          {input.area}
        </div>
      )}
      <SceneBand>
        <Stagger className="space-y-3">
          {places.map((place, i) => (
            <ItemRow
              key={i}
              emoji={place?.emoji}
              name={place?.name}
              category={place?.cuisine}
              rating={place?.rating}
              priceLevel={place?.priceLevel}
              blurb={place?.blurb}
              tags={place?.tags?.filter(Boolean) as string[] | undefined}
              onClick={
                place?.name
                  ? () => ask(`Tell me more about ${place.name}`)
                  : undefined
              }
            />
          ))}
        </Stagger>
      </SceneBand>
    </SceneShell>
  );
}
