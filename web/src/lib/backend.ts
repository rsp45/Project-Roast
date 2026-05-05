type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

let cache: TokenCache | null = null;

export async function getBackendAccessToken() {
  const now = Date.now();
  if (cache && cache.expiresAtMs - now > 30_000) {
    return cache.accessToken;
  }

  const res = await fetch("/api/backend/token", { cache: "no-store" });
  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = await res.json();
    } catch {
      try {
        detail = await res.text();
      } catch {
        detail = null;
      }
    }

    const suffix = detail
      ? `: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`
      : "";
    throw new Error(`Unable to fetch backend token (${res.status})${suffix}`);
  }

  const data = (await res.json()) as { accessToken: string; expiresIn: number };
  cache = { accessToken: data.accessToken, expiresAtMs: now + data.expiresIn * 1000 };
  return data.accessToken;
}

export async function backendFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  }

  const token = await getBackendAccessToken();

  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Backend request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}
