"use client";

import { useMemo, useRef, useState } from "react";
import type { GameMap, Floor, Room } from "@/data/types";

const MIN_SCALE = 0.6;
const MAX_SCALE = 5;

export function MapViewer({ map }: { map: GameMap }) {
  // Etagen von oben (höchster order) nach unten sortiert für die Buttonleiste.
  const floors = useMemo(
    () => [...map.floors].sort((a, b) => b.order - a.order),
    [map.floors],
  );

  const [activeId, setActiveId] = useState(
    floors[0]?.id ?? map.floors[0]?.id,
  );
  const activeFloor: Floor | undefined =
    map.floors.find((f) => f.id === activeId) ?? map.floors[0];

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Pan/Zoom-Transform.
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, moved: false });

  function reset() {
    setScale(1);
    setTx(0);
    setTy(0);
  }

  function selectFloor(id: string) {
    setActiveId(id);
    setSelectedRoom(null);
    reset();
  }

  function zoomBy(factor: number, originX?: number, originY?: number) {
    const rect = viewportRef.current?.getBoundingClientRect();
    const px = originX ?? (rect ? rect.width / 2 : 0);
    const py = originY ?? (rect ? rect.height / 2 : 0);
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * factor));
      // Zoom auf den Cursor/Zentrum ausrichten.
      setTx((t) => px - ((px - t) / prev) * next);
      setTy((t) => py - ((py - t) / prev) * next);
      return next;
    });
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomBy(factor, e.clientX - rect.left, e.clientY - rect.top);
  }

  function onPointerDown(e: React.PointerEvent) {
    drag.current = {
      active: true,
      startX: e.clientX - tx,
      startY: e.clientY - ty,
      moved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return;
    const nx = e.clientX - drag.current.startX;
    const ny = e.clientY - drag.current.startY;
    if (Math.abs(nx - tx) > 3 || Math.abs(ny - ty) > 3) {
      drag.current.moved = true;
    }
    setTx(nx);
    setTy(ny);
  }

  function onPointerUp(e: React.PointerEvent) {
    drag.current.active = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      {/* Viewer */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {/* Etagen-Umschalter */}
        <div className="flex items-center justify-between gap-2 border-b border-border p-3">
          <div className="flex flex-wrap gap-1">
            {floors.map((f) => (
              <button
                key={f.id}
                onClick={() => selectFloor(f.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  f.id === activeId
                    ? "bg-accent text-bg"
                    : "bg-surface-2 text-muted hover:text-text"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton label="Verkleinern" onClick={() => zoomBy(1 / 1.2)}>
              −
            </IconButton>
            <IconButton label="Vergrößern" onClick={() => zoomBy(1.2)}>
              +
            </IconButton>
            <button
              onClick={reset}
              className="rounded-md bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-muted hover:text-text"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Interaktive Fläche */}
        <div
          ref={viewportRef}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="relative h-[62vh] min-h-[360px] cursor-grab touch-none select-none overflow-hidden bg-[#0e1118] active:cursor-grabbing"
        >
          {activeFloor && (
            <div
              className="absolute left-0 top-0 origin-top-left will-change-transform"
              style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
            >
              <div className="relative w-[min(100%,1200px)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeFloor.image}
                  alt={`${map.name} – ${activeFloor.name}`}
                  className="block w-full select-none"
                  draggable={false}
                />
                {/* Raum-Overlay */}
                {activeFloor.rooms?.map((room) => (
                  <RoomHotspot
                    key={room.id}
                    room={room}
                    active={selectedRoom?.id === room.id}
                    onSelect={() => {
                      if (drag.current.moved) return;
                      setSelectedRoom(room);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-bg/70 px-2 py-1 text-xs text-muted">
            Ziehen zum Verschieben · Scrollen zum Zoomen
          </div>
        </div>
      </div>

      {/* Seitenleiste: Räume der aktiven Etage */}
      <aside className="rounded-xl border border-border bg-surface p-4">
        <h3 className="mb-1 font-bold">{activeFloor?.name}</h3>
        <p className="mb-4 text-sm text-muted">
          {activeFloor?.rooms?.length ?? 0} markierte Bereiche
        </p>

        {selectedRoom ? (
          <div className="mb-4 rounded-lg border border-accent/40 bg-surface-2 p-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-semibold">{selectedRoom.name}</span>
              {selectedRoom.objective && (
                <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-bg">
                  Objective
                </span>
              )}
            </div>
            {selectedRoom.description && (
              <p className="text-sm text-muted">{selectedRoom.description}</p>
            )}
          </div>
        ) : (
          <p className="mb-4 rounded-lg border border-dashed border-border p-3 text-sm text-muted">
            Klicke einen Bereich auf der Karte an.
          </p>
        )}

        <ul className="flex flex-col gap-1">
          {activeFloor?.rooms?.map((room) => (
            <li key={room.id}>
              <button
                onClick={() => setSelectedRoom(room)}
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                  selectedRoom?.id === room.id
                    ? "bg-surface-2 text-text"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                {room.objective && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                )}
                {room.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-lg font-bold text-muted hover:text-text"
    >
      {children}
    </button>
  );
}

function RoomHotspot({
  room,
  active,
  onSelect,
}: {
  room: Room;
  active: boolean;
  onSelect: () => void;
}) {
  const base =
    "absolute border-2 transition-colors flex items-center justify-center text-center";
  const color = room.objective
    ? "border-accent bg-accent/15 hover:bg-accent/30"
    : "border-attacker/70 bg-attacker/10 hover:bg-attacker/25";
  const activeCls = active ? "ring-2 ring-white/70" : "";

  if (room.shape === "circle") {
    const d = (room.radius ?? 5) * 2;
    return (
      <button
        onClick={onSelect}
        title={room.name}
        className={`${base} ${color} ${activeCls} rounded-full`}
        style={{
          left: `${room.x - (room.radius ?? 5)}%`,
          top: `${room.y - (room.radius ?? 5)}%`,
          width: `${d}%`,
          height: `${d}%`,
        }}
      />
    );
  }

  return (
    <button
      onClick={onSelect}
      title={room.name}
      className={`${base} ${color} ${activeCls} rounded-md p-1`}
      style={{
        left: `${room.x}%`,
        top: `${room.y}%`,
        width: `${room.width ?? 10}%`,
        height: `${room.height ?? 10}%`,
      }}
    >
      <span className="pointer-events-none text-[11px] font-semibold text-text drop-shadow">
        {room.name}
      </span>
    </button>
  );
}
