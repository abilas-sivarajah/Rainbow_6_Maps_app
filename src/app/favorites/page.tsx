import type { Metadata } from "next";
import { FavoritesClient } from "@/components/FavoritesClient";

export const metadata: Metadata = {
  title: "Favoriten · R6 Codex",
  description: "Deine gemerkten Operator und Maps.",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
