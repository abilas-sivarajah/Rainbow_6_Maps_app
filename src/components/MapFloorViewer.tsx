"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameMap } from "@/data/types";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedFloorName } from "@/data/i18n";
import roomsData from "@/data/rooms.json";

const MIN = 0.1;
const MAX = 12;

interface Room {
  name: string;
  x: number;
  y: number;
}

const typedRoomsData = roomsData as Record<string, Record<string, Room[]>>;

export function MapFloorViewer({ map }: { map: GameMap }) {
  const { language, t: translate } = useLanguage();
  const floors = map.floors;

  // Startetage optional aus der URL (?floor=<id>).
  const initialActive = (() => {
    if (typeof window === "undefined") return 0;
    const id = new URLSearchParams(window.location.search).get("floor");
    const idx = floors.findIndex((f) => f.id === id);
    return idx >= 0 ? idx : 0;
  })();
  const [active, setActive] = useState(initialActive);
  const [fs, setFs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ping, setPing] = useState<{ x: number; y: number; id: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const t = useRef({ scale: 1, tx: 0, ty: 0 });
  const raf = useRef(0);
  const drag = useRef({ on: false, sx: 0, sy: 0 });
  const fitted = useRef(false);
  const pingIdRef = useRef(0);

  const paint = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = mapWrapperRef.current;
      if (!el) return;
      const s = t.current;
      el.style.transform = `translate(${s.tx}px, ${s.ty}px) scale(${s.scale})`;
    });
  }, []);

  const fit = useCallback(() => {
    const vp = viewportRef.current;
    const img = imgRef.current;
    const wrapper = mapWrapperRef.current;
    if (!vp || !img || !wrapper) return;
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
    wrapper.style.transform = `translate(${t.current.tx}px, ${t.current.ty}px) scale(${scale})`;
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

  // Focus on a room
  const focusRoom = useCallback((xp: number, yp: number) => {
    const vp = viewportRef.current;
    const img = imgRef.current;
    if (!vp || !img) return;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih || !vw || !vh) return;

    const nextScale = 2.0;
    const rx = (xp / 100) * iw;
    const ry = (yp / 100) * ih;

    t.current = {
      scale: nextScale,
      tx: vw / 2 - rx * nextScale,
      ty: vh / 2 - ry * nextScale,
    };

    paint();
  }, [paint]);

  // Clear ping after 3s
  useEffect(() => {
    if (!ping) return;
    const timer = setTimeout(() => setPing(null), 3000);
    return () => clearTimeout(timer);
  }, [ping]);



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

  // Vollbild-Status verfolgen und danach neu einpassen.
  useEffect(() => {
    const onFsChange = () => {
      const active = document.fullscreenElement === rootRef.current;
      setFs(active);
      requestAnimationFrame(() => fit());
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
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

  const selectFloor = (i: number) => {
    setActive(i);
    setPing(null);
    setSearchQuery("");
    // URL aktualisieren (teilbar), ohne Navigation.
    const url = new URL(window.location.href);
    url.searchParams.set("floor", floors[i].id);
    window.history.replaceState(null, "", url.toString());
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      rootRef.current?.requestFullscreen?.();
    }
  };

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
  const mapRooms = typedRoomsData[map.id]?.[current.id] || [];
  const filteredRooms = mapRooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoomClick = (room: Room) => {
    focusRoom(room.x, room.y);
    pingIdRef.current += 1;
    setPing({ x: room.x, y: room.y, id: pingIdRef.current });
  };

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-xl border border-border bg-surface flex flex-col animate-fade-in"
    >
      {/* Etagen-Umschalter + Zoom-Steuerung */}
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <div className="flex flex-wrap gap-1">
          {floors.map((f, i) => (
            <button
              key={f.id}
              onClick={() => selectFloor(i)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
                i === active
                  ? "bg-accent text-bg shadow-md scale-102"
                  : "bg-surface-2 text-muted hover:text-text hover:bg-surface-3"
              }`}
            >
              {getLocalizedFloorName(map.id, f.id, language, f.name)}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => zoomButton(1.25)}
            aria-label={translate("maps.zoomIn")}
            className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-lg font-bold text-muted hover:text-text hover:bg-surface-3 transition-colors"
          >
            +
          </button>
          <button
            onClick={() => zoomButton(1 / 1.25)}
            aria-label={translate("maps.zoomOut")}
            className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-lg font-bold text-muted hover:text-text hover:bg-surface-3 transition-colors"
          >
            −
          </button>
          <button
            onClick={() => fit()}
            className="rounded-md bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-surface-3 transition-colors"
          >
            {translate("maps.reset")}
          </button>
          <button
            onClick={toggleFullscreen}
            aria-label={fs ? translate("maps.exitFullscreen") : translate("maps.fullscreen")}
            title={fs ? translate("maps.exitFullscreen") : translate("maps.fullscreen")}
            className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-muted hover:text-text hover:bg-surface-3 transition-colors"
          >
            {fs ? "🗗" : "⛶"}
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
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
          className={`flex-1 relative cursor-grab touch-none select-none overflow-hidden bg-[#0e1118] active:cursor-grabbing transition-colors duration-300 ${
            fs ? "h-[calc(100vh-3.5rem)]" : "h-[78vh] min-h-[420px]"
          }`}
        >
          {/* Map Wrapper (transforms image & overlays together) */}
          <div
            ref={mapWrapperRef}
            className="absolute left-0 top-0 origin-top-left select-none will-change-transform"
            style={{ width: current.w, height: current.h }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={current.image}
              alt={`${map.name} – ${getLocalizedFloorName(map.id, current.id, language, current.name)}`}
              draggable={false}
              onLoad={() => {
                if (!fitted.current) {
                  fitted.current = true;
                  fit();
                } else {
                  const wrapper = mapWrapperRef.current;
                  const s = t.current;
                  if (wrapper) {
                    wrapper.style.transform = `translate(${s.tx}px, ${s.ty}px) scale(${s.scale})`;
                  }
                }
              }}
              className="w-full h-full select-none"
            />
            {/* Realtime pulsing R6 indicator ping overlay */}
            {ping && (
              <div
                key={ping.id}
                style={{
                  left: `${ping.x}%`,
                  top: `${ping.y}%`,
                }}
                className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-10"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span className="relative block h-10 w-10 rounded-full border-4 border-accent bg-accent/30 shadow-lg"></span>
                <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-inner"></span>
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-bg/70 px-2 py-1 text-xs text-muted">
            {translate("maps.viewerLegend")}
          </div>
        </div>

        {/* Raumliste Sidebar */}
        {mapRooms.length > 0 && (
          <div
            className={`w-full md:w-72 shrink-0 bg-surface flex flex-col select-none ${
              fs ? "h-[calc(100vh-3.5rem)]" : "h-[78vh] min-h-[420px]"
            }`}
          >
            <div className="p-3 border-b border-border flex items-center justify-between bg-surface-2/20">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                {translate("maps.roomsTitle")} ({filteredRooms.length})
              </span>
            </div>
            
            <div className="p-3 border-b border-border bg-surface-2/10">
              <input
                type="text"
                placeholder={translate("maps.searchRoomsPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text placeholder-muted focus:border-accent focus:outline-none transition-all duration-200"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar bg-surface-2/5">
              {filteredRooms.map((room) => (
                <button
                  key={`${room.name}-${room.x}-${room.y}`}
                  onClick={() => handleRoomClick(room)}
                  className="w-full text-left rounded-md px-3 py-2 text-sm text-muted hover:text-text hover:bg-surface-2 transition-all duration-150 flex items-center justify-between group"
                >
                  <span className="font-semibold group-hover:text-accent transition-colors truncate pr-2">
                    {room.name}
                  </span>
                  <span className="text-[10px] shrink-0 font-mono bg-surface-3 text-muted px-1.5 py-0.5 rounded border border-border group-hover:border-accent/30 transition-all">
                    {Math.round(room.x)}%, {Math.round(room.y)}%
                  </span>
                </button>
              ))}
              {filteredRooms.length === 0 && (
                <p className="text-xs text-muted text-center p-4">
                  {translate("maps.noRoomsFound")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
