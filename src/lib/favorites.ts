"use client";

import { useSyncExternalStore } from "react";

// Einfacher, persistenter Favoriten-Store (localStorage), angebunden über
// useSyncExternalStore – dadurch SSR-sicher und ohne setState-im-Effect.

export type FavType = "operator" | "map";
export interface Favorites {
  operator: string[];
  map: string[];
}

const KEY = "r6codex_favs";
const EMPTY: Favorites = { operator: [], map: [] };

let current: Favorites = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function read(): Favorites {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
    if (parsed && Array.isArray(parsed.operator) && Array.isArray(parsed.map)) {
      return { operator: parsed.operator, map: parsed.map };
    }
  } catch {}
  return EMPTY;
}

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    current = read();
    initialized = true;
  }
}

function getSnapshot(): Favorites {
  ensureInit();
  return current;
}

function getServerSnapshot(): Favorites {
  return EMPTY;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      current = read();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleFavorite(type: FavType, id: string) {
  ensureInit();
  const arr = current[type];
  const has = arr.includes(id);
  current = {
    ...current,
    [type]: has ? arr.filter((x) => x !== id) : [...arr, id],
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {}
  listeners.forEach((l) => l());
}

export function useFavorites(): Favorites {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsFavorite(type: FavType, id: string): boolean {
  return useFavorites()[type].includes(id);
}
