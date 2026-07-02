/**
 * Smoke test for lib/prefetch.ts against a running dev server:
 *   npx tsx scripts/test-prefetch.ts
 * Verifies the SSE stream parses into a complete assistant UIMessage.
 */
import { prefetchAssistantMessage } from "../lib/prefetch";

// lib/prefetch uses a relative URL (it runs in the browser); rebase it here.
const realFetch = globalThis.fetch;
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
  realFetch(
    typeof input === "string" && input.startsWith("/")
      ? `http://127.0.0.1:3210${input}`
      : input,
    init
  )) as typeof fetch;

function summarize(message: Awaited<ReturnType<typeof prefetchAssistantMessage>>, ms: number) {
  const toolPart = message.parts.find((p) => p.type.startsWith("tool-"));
  return {
    ms,
    id: message.id,
    role: message.role,
    parts: message.parts.map((p) => p.type),
    toolState: toolPart && "state" in toolPart ? toolPart.state : null,
    inputKeys:
      toolPart && "input" in toolPart && toolPart.input
        ? Object.keys(toolPart.input as object)
        : null,
  };
}

async function main() {
  const controller = new AbortController();

  // Turn 1: prefetch from an empty conversation (hover before first tap).
  let started = Date.now();
  const first = await prefetchAssistantMessage([], "Hello", controller.signal);
  console.log("turn 1:", JSON.stringify(summarize(first, Date.now() - started)));

  // Turn 2: prefetch on top of a history that contains an injected turn —
  // exercises convertToModelMessages with our client-built messages.
  const { makeUserMessage } = await import("../lib/prefetch");
  const history = [makeUserMessage("Hello"), first];
  started = Date.now();
  const second = await prefetchAssistantMessage(
    history,
    "Recommend me a cozy movie",
    controller.signal
  );
  console.log("turn 2:", JSON.stringify(summarize(second, Date.now() - started)));

  if (!first.id || !second.id) throw new Error("Missing message ids");
  console.log("OK");
}

main().catch((error) => {
  console.error("FAILED:", error);
  process.exit(1);
});
