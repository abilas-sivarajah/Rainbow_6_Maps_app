"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useFavorites } from "@/lib/favorites";
import { maps } from "@/data/maps";
import { OperatorCard } from "./OperatorCard";
import { MapCard } from "./MapCard";

export function FavoritesClient() {
  const { operators, t } = useLanguage();
  const favs = useFavorites();

  const favOps = operators.filter((o) => favs.operator.includes(o.slug));
  const favMaps = maps.filter((m) => favs.map.includes(m.id));
  const empty = favOps.length === 0 && favMaps.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-black">{t("fav.title")}</h1>

      {empty ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted">
          {t("fav.empty")}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {favOps.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("nav.operators")} ({favOps.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favOps.map((o) => (
                  <OperatorCard key={o.slug} operator={o} />
                ))}
              </div>
            </section>
          )}

          {favMaps.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("nav.maps")} ({favMaps.length})
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {favMaps.map((m) => (
                  <MapCard key={m.id} map={m} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
