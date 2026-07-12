import type { Metadata } from "next";
import { weapons } from "@/data/weapons";
import { StatBar, Tag } from "@/components/ui";

export const metadata: Metadata = {
  title: "Waffen · R6 Codex",
  description: "Alle Waffen mit Stats: Schaden, Feuerrate, Mobilität, Magazin.",
};

export default function WeaponsPage() {
  const byType = weapons.reduce<Record<string, typeof weapons>>((acc, w) => {
    (acc[w.type] ??= []).push(w);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-black">Waffen</h1>
      <p className="mb-8 text-muted">
        Stats aller im Datensatz hinterlegten Waffen, gruppiert nach Typ.
      </p>

      <div className="flex flex-col gap-10">
        {Object.entries(byType).map(([type, list]) => (
          <section key={type}>
            <h2 className="mb-4 text-lg font-bold">{type}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {list.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="font-semibold">{w.name}</span>
                    <Tag>
                      {w.magazine} / {w.capacity}
                    </Tag>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <StatBar label="Schaden" value={w.damage} max={80} />
                    <StatBar
                      label="Feuerrate"
                      value={w.fireRate}
                      max={1300}
                      suffix="RPM"
                    />
                    <StatBar label="Mobilität" value={w.mobility} max={100} />
                    <StatBar label="Magazin" value={w.magazine} max={60} />
                  </div>
                  {w.description && (
                    <p className="mt-3 text-sm text-muted">{w.description}</p>
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
