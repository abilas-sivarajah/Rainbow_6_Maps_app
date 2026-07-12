import type { Metadata } from "next";
import { operators, allRoles } from "@/data/operators";
import { OperatorBrowser } from "@/components/OperatorBrowser";

export const metadata: Metadata = {
  title: "Operator · R6 Codex",
  description:
    "Alle Rainbow-Six-Operator mit Fähigkeiten, Stats und Loadouts – filterbar nach Seite und Rolle.",
};

export default function OperatorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-black">Operator</h1>
      <p className="mb-8 text-muted">
        Filtere nach Angreifer/Verteidiger und Rolle oder suche direkt nach
        Name, Einheit oder Gadget.
      </p>
      <OperatorBrowser operators={operators} roles={allRoles} />
    </div>
  );
}
