import type { Metadata } from "next";
import { OperatorsPageClient } from "@/components/OperatorsPageClient";

export const metadata: Metadata = {
  title: "Operator · R6 Codex",
  description:
    "Alle Rainbow-Six-Operator mit Fähigkeiten, Stats und Loadouts – filterbar nach Seite und Rolle.",
};

export default function OperatorsPage() {
  return <OperatorsPageClient />;
}
