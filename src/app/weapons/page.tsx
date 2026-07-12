import type { Metadata } from "next";
import type { Weapon } from "@/data/types";
import { weapons, asset } from "@/data/r6";
import { AssetImage } from "@/components/AssetImage";
import { StatBar, Tag } from "@/components/ui";

export const metadata: Metadata = {
  title: "Waffen · R6 Codex",
  description: "Alle Waffen mit Stats: Schaden, Feuerrate, Mobilität, Magazin.",
};

export default function WeaponsPage() {
  // Nach Typ gruppieren; Waffen ohne Typ unter "Sonstige".
  const byType = weapons.reduce<Record<string, Weapon[]>>((acc, w) => {
    const key = w.type ?? "Sonstige";
    (acc[key] ??= []).push(w);
    return acc;
  }, {});
  const types = Object.keys(byType).sort();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-black">Waffen</h1>
      <p className="mb-8 text-muted">
        Stats aller {weapons.length} Waffen, gruppiert nach Typ.
      </p>

      <div className="flex flex-col gap-10">
        {types.map((type) => (
          <section key={type}>
            <h2 className="mb-4 text-lg font-bold">
              {type}{" "}
              <span className="text-sm font-normal text-muted">
                ({byType[type].length})
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {byType[type].map((w) => (
                <div
                  key={w.name}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AssetImage
                        src={asset(w.image)}
                        alt={w.name}
                        className="h-8 w-14 shrink-0 object-contain"
                      />
                      <span className="font-semibold">{w.name}</span>
                    </div>
                    {w.magazine != null && (
                      <Tag>Mag {w.magazine}</Tag>
                    )}
                  </div>
                  {w.damage == null && w.rpm == null ? (
                    <p className="text-sm text-muted">
                      Keine Stats hinterlegt.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {typeof w.damage === "number" && (
                        <StatBar label="Schaden" value={w.damage} max={80} />
                      )}
                      {typeof w.rpm === "number" && (
                        <StatBar
                          label="Feuerrate"
                          value={w.rpm}
                          max={1300}
                          suffix="RPM"
                        />
                      )}
                      {typeof w.mobility === "number" && (
                        <StatBar label="Mobilität" value={w.mobility} max={100} />
                      )}
                      {w.ammoType && (
                        <div className="flex items-end justify-between text-sm">
                          <span className="text-muted">Kaliber</span>
                          <span className="font-medium">{w.ammoType}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {w.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-muted">
                      {w.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
