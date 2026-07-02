/** In-memory GET cache + in-flight dedupe to avoid duplicate API calls. */

const cache = new Map<string, { data: unknown; expires: number }>();
const inflight = new Map<string, Promise<unknown>>();
const DEFAULT_TTL_MS = 5 * 60_000;

export function seedFetchCache(url: string, data: unknown, ttlMs = DEFAULT_TTL_MS) {
  cache.set(url, { data, expires: Date.now() + ttlMs });
}

export async function fetchCachedJson<T>(
  url: string,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && hit.expires > now) {
    return hit.data as T;
  }

  const pending = inflight.get(url);
  if (pending) {
    return pending as Promise<T>;
  }

  const request = (async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed: ${url}`);
    }
    const data = (await response.json()) as T;
    cache.set(url, { data, expires: Date.now() + ttlMs });
    return data;
  })();

  inflight.set(url, request);

  try {
    return (await request) as T;
  } finally {
    inflight.delete(url);
  }
}

export function invalidateFetchCache(url?: string) {
  if (url) {
    cache.delete(url);
    inflight.delete(url);
    return;
  }
  cache.clear();
  inflight.clear();
}

export function invalidateFetchCachePrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key);
  }
}
