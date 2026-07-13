"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Liefert nach der Hydration `true`, auf dem Server `false` – SSR-sicher und
 * ohne setState-im-Effect. Nützlich, um clientseitige (z.B. datums- oder
 * zufallsabhängige) Inhalte ohne Hydration-Mismatch zu rendern.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
