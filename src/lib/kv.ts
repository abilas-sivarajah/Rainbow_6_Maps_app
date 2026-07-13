// Minimal Upstash Redis REST client (no extra npm dependency — same
// "just fetch" philosophy as ubi.ts). Used as a *shared* cache across all
// Vercel serverless instances, so a login ticket obtained by one instance is
// immediately reusable by every other instance instead of each one logging
// in independently.
//
// Configure by connecting an Upstash/Redis storage integration on Vercel (or
// a free account at upstash.com) and setting the REST URL + token as env
// vars. Either naming convention is accepted, since Vercel's own storage
// integrations and a direct Upstash account label them slightly differently:
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN   (Upstash-native)
//   KV_REST_API_URL / KV_REST_API_TOKEN                 (Vercel-provisioned)
//
// Entirely optional: when unset, callers fall back to the existing per-
// instance disk cache (see ubi.ts), so local dev needs no extra setup.

const URL_ = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export function hasKv(): boolean {
  return !!URL_ && !!TOKEN;
}

async function command<T = unknown>(args: (string | number)[]): Promise<T> {
  const res = await fetch(URL_!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  const body = (await res.json()) as { result?: T; error?: string };
  if (body.error) throw new Error(`Upstash error: ${body.error}`);
  return body.result as T;
}

export async function kvGet(key: string): Promise<string | null> {
  return (await command<string | null>(['GET', key])) ?? null;
}

export async function kvSet(key: string, value: string, exSeconds: number): Promise<void> {
  await command(['SET', key, value, 'EX', exSeconds]);
}

/** Atomic "set if not exists" — used as a short-lived distributed lock. */
export async function kvSetNx(key: string, value: string, exSeconds: number): Promise<boolean> {
  const result = await command<string | null>(['SET', key, value, 'NX', 'EX', exSeconds]);
  return result === 'OK';
}

export async function kvDel(key: string): Promise<void> {
  await command(['DEL', key]);
}
