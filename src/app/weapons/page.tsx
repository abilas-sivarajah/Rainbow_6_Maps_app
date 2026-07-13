import type { Metadata } from "next";
import { WeaponsBrowser } from "@/components/WeaponsBrowser";

export const metadata: Metadata = {
  title: "Waffen · R6 Codex",
  description: "Alle Waffen mit Stats: Schaden, Feuerrate, Mobilität, Magazin.",
};

export default function WeaponsPage() {
  return <WeaponsBrowser />;
}
