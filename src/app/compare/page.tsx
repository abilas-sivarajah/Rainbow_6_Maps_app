import type { Metadata } from "next";
import { CompareClient } from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "Operator-Vergleich · R6 Codex",
  description: "Vergleiche zwei Operator: Stats, Fähigkeit und Loadout.",
};

export default function ComparePage() {
  return <CompareClient />;
}
