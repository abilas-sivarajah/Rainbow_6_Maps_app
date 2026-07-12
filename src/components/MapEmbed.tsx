"use client";

import { useState } from "react";
import type { GameMap } from "@/data/types";

export function MapEmbed({ map }: { map: GameMap }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[#1a1a1a]">
      {!loaded && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-surface">
          <div className="flex flex-col items-center gap-3 text-muted">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
            <span className="text-sm">Etagen-Viewer wird geladen …</span>
          </div>
        </div>
      )}
      <iframe
        src={map.viewer}
        title={`${map.name} – Etagen-Viewer`}
        className="h-[78vh] min-h-[420px] w-full"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
