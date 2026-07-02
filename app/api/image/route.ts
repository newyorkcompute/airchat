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

  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, MAX_QUERY_LENGTH);
  if (!q) {
    return Response.json({ error: "Missing q" }, { status: 400 });
  }

  // Scenes fire a burst of lookups (one per tile), so this bucket is much
  // looser than the chat limit.
  if (isRateLimited(clientIp(request), { bucket: "image", max: 60 })) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const cacheKey = q.toLowerCase();
  let url = memoryCache.get(cacheKey);

  if (url === undefined) {
    try {
      const res = await fetch(
        `https://api.search.brave.com/res/v1/images/search?q=${encodeURIComponent(q)}&count=3&safesearch=strict`,
        {
          headers: {
            "X-Subscription-Token": apiKey,
            Accept: "application/json",
          },
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
    memoryCache.set(cacheKey, url);
    if (memoryCache.size > 2_000) {
      memoryCache.delete(memoryCache.keys().next().value as string);
    }
  }

  return Response.json(
    { url },
    {
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
