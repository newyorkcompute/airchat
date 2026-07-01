import { tool, type InferUITools, type UIMessage, type UIDataTypes } from "ai";
import { z } from "zod";

/**
 * Scene tools: the model answers every turn by calling exactly one of these.
 * The tool INPUT is the UI — it streams to the client and is rendered as a
 * full-bleed scene. `execute` is a no-op acknowledgement.
 */

const intro = z
  .string()
  .describe(
    "One short, friendly, conversational sentence introducing the scene, addressed to the user."
  );

const emoji = z.string().describe("A single emoji");

export const sceneTools = {
  restaurantList: tool({
    description:
      "Show a curated list of restaurants, cafes, bars or similar venues in an area. Use for 'best X spots', 'where should I eat', venue recommendations.",
    inputSchema: z.object({
      intro,
      area: z.string().describe("Neighborhood or city, e.g. 'Portland, ME'"),
      places: z
        .array(
          z.object({
            emoji,
            name: z.string(),
            cuisine: z.string().describe("Short category, e.g. 'Japanese'"),
            rating: z.number().min(1).max(5).describe("e.g. 4.7"),
            priceLevel: z.number().min(1).max(4).describe("1=$ to 4=$$$$"),
            blurb: z
              .string()
              .describe("One vivid sentence on why this place is special"),
            tags: z.array(z.string()).max(3),
          })
        )
        .min(3)
        .max(6),
    }),
    execute: async () => ({ displayed: true }),
  }),

  placeDetail: tool({
    description:
      "Show a rich detail page for ONE specific place (restaurant, hotel, attraction). Use when the user asks about a single venue.",
    inputSchema: z.object({
      intro,
      emoji,
      name: z.string(),
      rating: z.number().min(1).max(5),
      category: z.string().describe("e.g. 'Japanese'"),
      location: z.string().describe("Street or neighborhood, e.g. 'Fore St'"),
      priceLevel: z.number().min(1).max(4),
      description: z
        .string()
        .describe("Two evocative sentences about the place"),
      tags: z.array(z.string()).max(4),
      highlights: z
        .array(z.object({ emoji, title: z.string(), detail: z.string() }))
        .min(2)
        .max(4)
        .describe("Notable things: signature dish, ambiance, best time to go"),
    }),
    execute: async () => ({ displayed: true }),
  }),

  comparison: tool({
    description:
      "Compare exactly two products, places, or options side by side across several themed sections. Use for 'X vs Y' or 'how does X compare'.",
    inputSchema: z.object({
      intro,
      itemA: z.object({
        emoji,
        name: z.string(),
        subtitle: z.string().describe("e.g. 'From $70,000'"),
      }),
      itemB: z.object({
        emoji,
        name: z.string(),
        subtitle: z.string(),
      }),
      sections: z
        .array(
          z.object({
            emoji,
            title: z.string().describe("e.g. 'Range and performance'"),
            rows: z
              .array(
                z.object({
                  valueA: z.string().describe("Short stat, e.g. 'Up to 512 mi'"),
                  valueB: z.string(),
                  better: z
                    .enum(["a", "b", "tie"])
                    .describe("Which side wins this row"),
                  note: z
                    .string()
                    .describe(
                      "Tiny annotation for the losing/winning side, e.g. 'Slightly less range' or 'More horsepower'"
                    ),
                })
              )
              .min(2)
              .max(5),
          })
        )
        .min(2)
        .max(4),
      verdict: z
        .string()
        .describe("One-sentence bottom line recommendation"),
    }),
    execute: async () => ({ displayed: true }),
  }),

  recipe: tool({
    description:
      "Show a full recipe with ingredients and step-by-step instructions. Use for any cooking/baking/drink request.",
    inputSchema: z.object({
      intro,
      title: z.string(),
      meta: z.object({
        time: z.string().describe("e.g. '35 min'"),
        servings: z.string().describe("e.g. '24 cookies'"),
        difficulty: z.string().describe("e.g. 'Easy'"),
      }),
      ingredients: z
        .array(
          z.object({
            emoji,
            name: z.string(),
            amount: z.string().describe("e.g. '1 cup melted'"),
          })
        )
        .min(4)
        .max(12),
      steps: z
        .array(
          z.object({
            emoji,
            title: z.string().describe("Short imperative, e.g. 'Heat the oven'"),
            detail: z.string().describe("1-2 sentence instruction"),
          })
        )
        .min(3)
        .max(8),
    }),
    execute: async () => ({ displayed: true }),
  }),

  mediaDetail: tool({
    description:
      "Show a rich detail page for ONE movie, show, book, album, podcast or game. Use when the user asks about a single title.",
    inputSchema: z.object({
      intro,
      emoji,
      title: z.string(),
      subtitle: z
        .string()
        .describe("Meta line, e.g. '2016 · Musical romance · PG-13'"),
      rating: z.number().min(1).max(5).describe("Critic-style rating, e.g. 4.5"),
      description: z
        .string()
        .describe("Two evocative sentences about what it is and how it feels"),
      tags: z.array(z.string()).max(4),
      highlights: z
        .array(z.object({ emoji, title: z.string(), detail: z.string() }))
        .min(2)
        .max(4)
        .describe(
          "Standout aspects: a famous scene, the soundtrack, best watching mood"
        ),
    }),
    execute: async () => ({ displayed: true }),
  }),

  mediaGrid: tool({
    description:
      "Show sectioned recommendations of movies, shows, books, music, podcasts or games. Use for 'recommend me a movie/book/...' requests.",
    inputSchema: z.object({
      intro,
      sections: z
        .array(
          z.object({
            title: z
              .string()
              .describe("Playful section name, e.g. 'Best first picks'"),
            items: z
              .array(
                z.object({
                  emoji,
                  title: z.string(),
                  subtitle: z
                    .string()
                    .describe("Micro-summary, e.g. 'Inner-self adventure story'"),
                  tags: z.array(z.string()).max(2),
                })
              )
              .min(2)
              .max(4),
          })
        )
        .min(1)
        .max(3),
    }),
    execute: async () => ({ displayed: true }),
  }),

  textResponse: tool({
    description:
      "Fallback for anything that does not fit the other scenes: explanations, advice, general questions, chit-chat. Prefer a more specific scene when possible.",
    inputSchema: z.object({
      intro,
      heading: z.string().describe("Short title for the answer"),
      body: z
        .string()
        .describe("2-4 plain-prose sentences answering the question"),
      bullets: z
        .array(z.object({ emoji, text: z.string() }))
        .max(6)
        .describe("Optional key points; empty array if not needed"),
    }),
    execute: async () => ({ displayed: true }),
  }),
};

export type SceneTools = InferUITools<typeof sceneTools>;
export type AirchatUIMessage = UIMessage<never, UIDataTypes, SceneTools>;
export type SceneToolName = keyof typeof sceneTools;
