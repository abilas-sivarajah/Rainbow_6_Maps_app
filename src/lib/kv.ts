// Shared cache used across all Vercel serverless instances, so a login
// ticket obtained by one instance is immediately reusable by every other
// instance instead of each one logging in independently.
//
// Backend: a standard Redis connection (REDIS_URL — matches Vercel's own
// "Redis" storage integration, using the official `redis` / node-redis
// client, as recommended in Vercel's own setup guide for that integration).
//
// Entirely optional: when REDIS_URL isn't set, callers fall back to the
// existing per-instance disk cache (see ubi.ts), so local dev needs no
// extra setup.

import { createClient, type RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL;

export function hasKv(): boolean {
  return !!REDIS_URL;
}

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

async function getRedisClient(): Promise<RedisClientType> {
  if (client?.isOpen) return client;
  if (connecting) return connecting;
  connecting = (async () => {
    const c: RedisClientType = createClient({ url: REDIS_URL });
    c.on('error', () => {
      /* swallowed — every call site already handles rejected promises */
    });
    await c.connect();
    client = c;
    return c;
  })().finally(() => {
    connecting = null;
  });
  return connecting;
}

export async function kvGet(key: string): Promise<string | null> {
  const c = await getRedisClient();
  return (await c.get(key)) ?? null;
}

export async function kvSet(key: string, value: string, exSeconds: number): Promise<void> {
  const c = await getRedisClient();
  await c.set(key, value, { EX: exSeconds });
}

/** Atomic "set if not exists" — used as a short-lived distributed lock. */
export async function kvSetNx(key: string, value: string, exSeconds: number): Promise<boolean> {
  const c = await getRedisClient();
  const result = await c.set(key, value, { NX: true, EX: exSeconds });
  return result === 'OK';
}

export async function kvDel(key: string): Promise<void> {
  const c = await getRedisClient();
  await c.del(key);
}
