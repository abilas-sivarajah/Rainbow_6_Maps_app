import type { Metadata } from "next";
import { MapsPageClient } from "@/components/MapsPageClient";

export const metadata: Metadata = {
  title: "Maps · R6 Codex",
  description:
    "Alle Rainbow-Six-Maps mit interaktivem Etagen-Viewer – zoombar und mit anklickbaren Bereichen.",
};

export default function MapsPage() {
  return <MapsPageClient />;
}
