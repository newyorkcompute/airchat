# airchat

AI with a visual interface. A chat app where the answer isn't text in a bubble — every turn the model generates a full-screen, interactive UI: restaurant lists, side-by-side comparisons, recipes, media picks, and more. Inspired by [Monogram](https://www.monogram.ai/).

## How it works

- **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui**, [Geist](https://vercel.com/geist/introduction) typography, animations with [Motion](https://motion.dev), light/dark theme via `next-themes` (toggle top-right, follows system by default).
- **AI SDK v6** streams a chat response through the **Vercel AI Gateway** (`app/api/chat/route.ts`).
- The model must answer every turn by calling exactly one **scene tool** (`lib/ai/tools.ts`) — `restaurantList`, `placeDetail`, `comparison`, `recipe`, `mediaGrid`, or `textResponse`. The tool's structured input *is* the UI.
- The client (`components/chat/`) renders each tool call as a full-bleed animated scene composed from design-system blocks (`components/blocks/`), streaming in as the data arrives.

## Run it locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) API key (Vercel dashboard → AI Gateway → API Keys) and put it in `.env.local`:

   ```bash
   AI_GATEWAY_API_KEY=vck_...
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 and ask for sushi spots, a cookie recipe, or an EV comparison.

### Configuration

- `AIRCHAT_MODEL` (optional) — any gateway `provider/model` slug, defaults to `openai/gpt-5.4-mini` (free-tier friendly). See `lib/ai/model.ts`.

## Roadmap (not in v1)

- Auth + per-user rate limiting
- Postgres/Neon persistence for conversations
- Voice input
- Real maps and photos
