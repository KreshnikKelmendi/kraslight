/** Client/server-safe JSON fetch with timeout (avoids infinite loading on slow APIs). */

export async function fetchJson<T>(
  url: string,
  options?: { timeoutMs?: number }
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 25_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
    });
    const data = (await response.json()) as T;
    if (!response.ok) {
      const message =
        data &&
        typeof data === 'object' &&
        'error' in data &&
        typeof (data as { error: unknown }).error === 'string'
          ? (data as { error: string }).error
          : `Request failed (${response.status})`;
      throw new Error(message);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}
