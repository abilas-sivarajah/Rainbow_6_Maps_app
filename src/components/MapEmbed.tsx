"use client";

import { useRef, useState } from "react";
import type { GameMap } from "@/data/types";

interface PanZoomApi {
  zoom: (factor: number) => void;
  reset: () => void;
}

/**
 * Reichert den (gleich-origin) iframe-Viewer nach dem Laden um Zoom per
 * Mausrad und Pan per Ziehen an – ohne die großen HTML-Dateien zu verändern.
 */
function setupPanZoom(iframe: HTMLIFrameElement): PanZoomApi {
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) throw new Error("kein iframe-Dokument");

  const wrap = doc.getElementById("wrap");
  const svg = wrap?.querySelector("svg") as SVGSVGElement | null;
  const bar = doc.getElementById("bar");
  if (!wrap || !svg) throw new Error("kein SVG im Viewer");

  const style = doc.createElement("style");
  style.textContent = `
    html,body{height:100%;margin:0;overflow:hidden}
    #wrap{position:absolute;left:0;right:0;bottom:0;padding:0;margin:0;
      overflow:hidden;cursor:grab;touch-action:none;background:#0e1118}
    #wrap.grabbing{cursor:grabbing}
    #wrap svg{position:absolute;top:0;left:0;margin:0;max-width:none;
      height:auto;transform-origin:0 0;will-change:transform}
  `;
  doc.head.appendChild(style);

  let scale = 1;
  let tx = 0;
  let ty = 0;
  const MIN = 0.05;
  const MAX = 20;

  const apply = () => {
    svg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };

  const positionWrap = () => {
    const barH = bar ? bar.getBoundingClientRect().height : 52;
    wrap.style.top = `${barH}px`;
  };

  const fit = () => {
    positionWrap();
    svg.style.transform = "none";
    const wr = wrap.getBoundingClientRect();
    const sr = svg.getBoundingClientRect();
    if (sr.width > 0 && wr.width > 0) {
      scale = Math.min(wr.width / sr.width, wr.height / sr.height) * 0.98;
      tx = (wr.width - sr.width * scale) / 2;
      ty = (wr.height - sr.height * scale) / 2;
    } else {
      scale = 1;
      tx = 0;
      ty = 0;
    }
    apply();
  };

  const zoomAt = (factor: number, px: number, py: number) => {
    const next = Math.min(MAX, Math.max(MIN, scale * factor));
    tx = px - ((px - tx) / scale) * next;
    ty = py - ((py - ty) / scale) * next;
    scale = next;
    apply();
  };

  wrap.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const r = wrap.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
    },
    { passive: false },
  );

  let dragging = false;
  let sx = 0;
  let sy = 0;
  wrap.addEventListener("pointerdown", (e) => {
    dragging = true;
    sx = e.clientX - tx;
    sy = e.clientY - ty;
    wrap.classList.add("grabbing");
    try {
      wrap.setPointerCapture(e.pointerId);
    } catch {}
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    tx = e.clientX - sx;
    ty = e.clientY - sy;
    apply();
  });
  const endDrag = () => {
    dragging = false;
    wrap.classList.remove("grabbing");
  };
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", endDrag);
  win.addEventListener("resize", fit);

  // Doppelklick zum Reinzoomen an der Cursorposition.
  wrap.addEventListener("dblclick", (e) => {
    const r = wrap.getBoundingClientRect();
    zoomAt(1.6, e.clientX - r.left, e.clientY - r.top);
  });

  fit();
  // Falls SVG-Maße erst spät stehen, erneut einpassen.
  win.setTimeout(fit, 120);

  return {
    zoom: (factor: number) => {
      const r = wrap.getBoundingClientRect();
      zoomAt(factor, r.width / 2, r.height / 2);
    },
    reset: fit,
  };
}

export function MapEmbed({ map }: { map: GameMap }) {
  const [loaded, setLoaded] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const apiRef = useRef<PanZoomApi | null>(null);

  function handleLoad(e: React.SyntheticEvent<HTMLIFrameElement>) {
    try {
      apiRef.current = setupPanZoom(e.currentTarget);
      setInteractive(true);
    } catch {
      // Falls die Injektion fehlschlägt, bleibt der Viewer wie geliefert nutzbar.
      setInteractive(false);
    }
    setLoaded(true);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[#0e1118]">
      {!loaded && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-surface">
          <div className="flex flex-col items-center gap-3 text-muted">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
            <span className="text-sm">Etagen-Viewer wird geladen …</span>
          </div>
        </div>
      )}

      {interactive && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg border border-border bg-bg/80 p-1 backdrop-blur">
          <button
            onClick={() => apiRef.current?.zoom(1.25)}
            aria-label="Vergrößern"
            title="Vergrößern"
            className="grid h-8 w-8 place-items-center rounded-md text-lg font-bold text-muted hover:bg-surface-2 hover:text-text"
          >
            +
          </button>
          <button
            onClick={() => apiRef.current?.zoom(1 / 1.25)}
            aria-label="Verkleinern"
            title="Verkleinern"
            className="grid h-8 w-8 place-items-center rounded-md text-lg font-bold text-muted hover:bg-surface-2 hover:text-text"
          >
            −
          </button>
          <button
            onClick={() => apiRef.current?.reset()}
            title="Ansicht zurücksetzen"
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text"
          >
            Reset
          </button>
        </div>
      )}

      <iframe
        src={map.viewer}
        title={`${map.name} – Etagen-Viewer`}
        className="h-[78vh] min-h-[420px] w-full"
        onLoad={handleLoad}
      />

      {interactive && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-md bg-bg/70 px-2 py-1 text-xs text-muted">
          Mausrad = Zoom · Ziehen = Verschieben · Doppelklick = Reinzoomen
        </div>
      )}
    </div>
  );
}
