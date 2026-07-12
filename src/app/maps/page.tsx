import type { Metadata } from "next";
import { maps } from "@/data/maps";
import { MapCard } from "@/components/MapCard";

export const metadata: Metadata = {
  title: "Maps · R6 Codex",
  description:
    "Alle Rainbow-Six-Maps mit interaktivem Etagen-Viewer – zoombar und mit anklickbaren Bereichen.",
};

export default function MapsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-black">Maps</h1>
      <p className="mb-8 text-muted">
        Wähle eine Map und klicke dich Etage für Etage durch.
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} />
        ))}
      </div>
    </div>
  );
}
