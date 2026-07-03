import type { SceneTools, SceneToolName } from "@/lib/ai/tools";

type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[] | undefined
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T | undefined;

/**
 * Tool input as seen by scene components. While the tool call streams,
 * the input is deeply partial. Every field may still be undefined.
 */
export type ScenePartInput<K extends SceneToolName> =
  | DeepPartial<SceneTools[K]["input"]>
  | undefined;
