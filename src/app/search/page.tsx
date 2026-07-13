import type { Metadata } from "next";
import { SearchClient } from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Suche · R6 Codex",
  description: "Durchsuche Operator, Waffen und Maps.",
};

export default function SearchPage() {
  return <SearchClient />;
}
