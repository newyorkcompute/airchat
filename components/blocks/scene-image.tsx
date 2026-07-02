"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Client-side memo so the same query never refetches within a session
// (the /api/image route and CDN cache across sessions).
const resolvedUrls = new Map<string, string | null>();

/**
 * Visual block for any scene item: renders the emoji instantly, then
 * resolves `query` via /api/image and cross-fades to the photo.
 * If the lookup fails or `query` is absent, the emoji simply stays —
 * images are pure progressive enhancement.
 *
 * The caller owns the container styling (aspect, rounding, text size
 * for the emoji) via className.
 */
export function SceneImage({
  query,
  emoji,
  fallback = "✨",
  className,
}: {
  query?: string;
  emoji?: string;
  fallback?: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(
    query ? (resolvedUrls.get(query) ?? null) : null
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!query || resolvedUrls.has(query)) return;
    const controller = new AbortController();
    fetch(`/api/image?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : { url: null }))
      .then((data: { url: string | null }) => {
        resolvedUrls.set(query, data.url);
        setUrl(data.url);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [query]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <span aria-hidden>{emoji ?? fallback}</span>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
