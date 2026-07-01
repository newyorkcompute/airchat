import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { sceneTools, type AirchatUIMessage } from "@/lib/ai/tools";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { MODEL_ID, FALLBACK_MODELS } from "@/lib/ai/model";

export const maxDuration = 60;

const MAX_MESSAGES = 30;
const MAX_TEXT_LENGTH = 2000;

export async function POST(request: Request) {
  const { messages }: { messages: AirchatUIMessage[] } = await request.json();

  const lastMessage = messages.at(-1);
  const lastText = lastMessage?.parts
    ?.map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  if (lastText && lastText.length > MAX_TEXT_LENGTH) {
    return Response.json({ error: "Message too long" }, { status: 413 });
  }

  const result = streamText({
    model: MODEL_ID,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages.slice(-MAX_MESSAGES)),
    tools: sceneTools,
    toolChoice: "required",
    // One tool call renders the scene; stop before the model can add a
    // follow-up text step.
    stopWhen: stepCountIs(1),
    providerOptions: {
      gateway: {
        models: FALLBACK_MODELS,
        tags: ["app:airchat", "feature:chat"],
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
