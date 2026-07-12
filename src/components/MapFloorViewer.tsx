"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameMap } from "@/data/types";

const MIN = 0.1;
const MAX = 12;

export function MapFloorViewer({ map }: { map: GameMap }) {
  const floors = map.floors;
  const [active, setActive] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const t = useRef({ scale: 1, tx: 0, ty: 0 });
  const raf = useRef(0);
  const drag = useRef({ on: false, sx: 0, sy: 0 });
  const fitted = useRef(false);

  const paint = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const img = imgRef.current;
      if (!img) return;
      const s = t.current;
      img.style.transform = `translate(${s.tx}px, ${s.ty}px) scale(${s.scale})`;
    });
  }, []);

  const fit = useCallback(() => {
    const vp = viewportRef.current;
    const img = imgRef.current;
    if (!vp || !img) return;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih || !vw || !vh) return;
    const scale = Math.min(vw / iw, vh / ih) * 0.98;
    t.current = {
      scale,
      tx: (vw - iw * scale) / 2,
      ty: (vh - ih * scale) / 2,
    };
    img.style.transform = `translate(${t.current.tx}px, ${t.current.ty}px) scale(${scale})`;
  }, []);

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      const s = t.current;
      const next = Math.min(MAX, Math.max(MIN, s.scale * factor));
      s.tx = px - ((px - s.tx) / s.scale) * next;
      s.ty = py - ((py - s.ty) / s.scale) * next;
      s.scale = next;
      paint();
    },
    [paint],
  );

  // Mausrad-Zoom (nativer, nicht-passiver Listener wegen preventDefault).
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = vp.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fit]);

  // Falls das Bild bereits vor der Hydration geladen ist, feuert onLoad nicht –
  // daher hier initial einpassen.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth && !fitted.current) {
      fitted.current = true;
      fit();
    }
  }, [fit]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { on: true, sx: e.clientX - t.current.tx, sy: e.clientY - t.current.ty };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    t.current.tx = e.clientX - drag.current.sx;
    t.current.ty = e.clientY - drag.current.sy;
    paint();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current.on = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const zoomButton = (factor: number) => {
    const vp = viewportRef.current;
    if (!vp) return;
    zoomAt(factor, vp.clientWidth / 2, vp.clientHeight / 2);
  };

  const current = floors[active];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {/* Etagen-Umschalter + Zoom-Steuerung */}
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <div className="flex flex-wrap gap-1">
          {floors.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setActive(i)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                i === active
                  ? "bg-accent text-bg"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => zoomButton(1.25)}
            aria-label="Vergrößern"
            className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-lg font-bold text-muted hover:text-text"
          >
            +
          </button>
          <button
            onClick={() => zoomButton(1 / 1.25)}
            aria-label="Verkleinern"
            className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-lg font-bold text-muted hover:text-text"
          >
            −
          </button>
          <button
            onClick={() => fit()}
            className="rounded-md bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-muted hover:text-text"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Interaktive Fläche */}
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          zoomAt(1.6, e.clientX - r.left, e.clientY - r.top);
        }}
        className="relative h-[78vh] min-h-[420px] cursor-grab touch-none select-none overflow-hidden bg-[#0e1118] active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={current.image}
          alt={`${map.name} – ${current.name}`}
          draggable={false}
          onLoad={() => {
            if (!fitted.current) {
              fitted.current = true;
              fit();
            } else {
              // Beim Etagenwechsel den aktuellen Zoom/Ausschnitt beibehalten.
              const img = imgRef.current;
              const s = t.current;
              if (img) {
                img.style.transform = `translate(${s.tx}px, ${s.ty}px) scale(${s.scale})`;
              }
            }
          }}
          className="absolute left-0 top-0 max-w-none origin-top-left select-none will-change-transform"
        />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-bg/70 px-2 py-1 text-xs text-muted">
          Mausrad = Zoom · Ziehen = Verschieben · Doppelklick = Reinzoomen
        </div>
      </div>
    </div>
  );
}
