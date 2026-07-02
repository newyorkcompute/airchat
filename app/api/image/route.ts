import { isRateLimited, clientIp } from "@/lib/rate-limit";

/**
 * Resolves a short query ("Lucid Air sedan", "Paddington 2 movie poster")
 * to one image URL via the Brave Image Search API. Scenes call this after
 * they render, so images are progressive enhancement — the emoji
 * placeholder stays if this fails.
 *
 * Cached three ways: per-instance memory, Vercel's CDN (s-maxage), and
 * the browser — image queries repeat heavily across users.
 */

const memoryCache = new Map<string, string | null>();
const MAX_QUERY_LENGTH = 100;

type BraveImageResult = {
  thumbnail?: { src?: string };
  properties?: { url?: string };
};

export async function GET(request: Request) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Image search not configured" }, { status: 503 });
  }

  // Normalize aggressively — every cache layer (memory, Next data cache,
  // CDN, browser) is keyed by this string, so "Lucid Air  Sedan" and
  // "lucid air sedan" must be one entry, not two Brave calls.
  const q = new URL(request.url).searchParams
    .get("q")
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, MAX_QUERY_LENGTH);
  if (!q) {
    return Response.json({ error: "Missing q" }, { status: 400 });
  }

  // Scenes fire a burst of lookups (one per tile), so this bucket is much
  // looser than the chat limit.
  if (isRateLimited(clientIp(request), { bucket: "image", max: 60 })) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let url = memoryCache.get(q);

  if (url === undefined) {
    try {
      const res = await fetch(
        `https://api.search.brave.com/res/v1/images/search?q=${encodeURIComponent(q)}&count=3&safesearch=strict`,
        {
          headers: {
            "X-Subscription-Token": apiKey,
            Accept: "application/json",
          },
          // Next's persistent data cache: survives cold starts and is
          // shared across serverless instances, unlike memoryCache. An
          // image for a query has no freshness needs — cache for 30 days.
          next: { revalidate: 60 * 60 * 24 * 30 },
        }
      );
      if (!res.ok) throw new Error(`Brave responded ${res.status}`);
      const data: { results?: BraveImageResult[] } = await res.json();
      // Prefer Brave's proxied thumbnails: consistent sizing and no
      // hotlink/CORS surprises from arbitrary origin servers.
      url =
        data.results
          ?.map((r) => r.thumbnail?.src ?? r.properties?.url)
          .find(Boolean) ?? null;
    } catch {
      // Report "no image" but don't cache the failure, so a transient
      // Brave error doesn't stick for the instance's lifetime.
      return Response.json({ url: null }, { status: 200 });
    }
    memoryCache.set(q, url);
    if (memoryCache.size > 2_000) {
      memoryCache.delete(memoryCache.keys().next().value as string);
    }
  }

  return Response.json(
    { url },
    {
      headers: {
        // A query's image never needs to be fresh: 30 days on the CDN,
        // a day in the browser, serve stale while revalidating.
        "Cache-Control":
          "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=2592000",
      },
    }
  );
}
