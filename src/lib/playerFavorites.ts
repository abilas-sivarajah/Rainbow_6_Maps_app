"use client";

import { useSyncExternalStore } from "react";
import type { Platform } from "./types";

// Gespeicherte Tracker-Spieler (localStorage), gleiches Muster wie
// src/lib/favorites.ts: useSyncExternalStore → SSR-sicher, tab-übergreifend.

export interface SavedPlayer {
  username: string;
  platform: Platform;
}

const KEY = "r6codex_saved_players";
const MAX = 24;
const EMPTY: SavedPlayer[] = [];
const PLATFORMS: Platform[] = ["uplay", "psn", "xbl"];

let current: SavedPlayer[] = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function keyOf(p: SavedPlayer): string {
  return `${p.platform}:${p.username.toLowerCase()}`;
}

function read(): SavedPlayer[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (p): p is SavedPlayer =>
            !!p &&
            typeof p.username === "string" &&
            p.username.trim() !== "" &&
            PLATFORMS.includes(p.platform),
        )
        .slice(0, MAX);
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

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {}
  listeners.forEach((l) => l());
}

function getSnapshot(): SavedPlayer[] {
  ensureInit();
  return current;
}

function getServerSnapshot(): SavedPlayer[] {
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

export function isPlayerSaved(p: SavedPlayer): boolean {
  ensureInit();
  return current.some((x) => keyOf(x) === keyOf(p));
}

export function togglePlayerSaved(p: SavedPlayer) {
  ensureInit();
  const trimmed: SavedPlayer = { ...p, username: p.username.trim() };
  if (!trimmed.username) return;
  if (isPlayerSaved(trimmed)) {
    current = current.filter((x) => keyOf(x) !== keyOf(trimmed));
  } else {
    current = [trimmed, ...current].slice(0, MAX);
  }
  persist();
}

export function removeSavedPlayer(p: SavedPlayer) {
  ensureInit();
  current = current.filter((x) => keyOf(x) !== keyOf(p));
  persist();
}

export function useSavedPlayers(): SavedPlayer[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsPlayerSaved(p: SavedPlayer): boolean {
  const saved = useSavedPlayers();
  return saved.some((x) => keyOf(x) === keyOf(p));
}
