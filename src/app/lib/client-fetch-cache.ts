/** In-memory GET cache to avoid duplicate API calls (e.g. Header + homepage sections). */

const cache = new Map<string, { data: unknown; expires: number }>();
const DEFAULT_TTL_MS = 60_000;

export async function fetchCachedJson<T>(
  url: string,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && hit.expires > now) {
    return hit.data as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }
  const data = (await response.json()) as T;
  cache.set(url, { data, expires: now + ttlMs });
  return data;
}

export function invalidateFetchCache(url?: string) {
  if (url) {
    cache.delete(url);
    return;
  }
  cache.clear();
}
