import type { Loadout } from "@/data/types";
import { getWeapon } from "@/data/weapons";
import { StatBar, Tag } from "./ui";

function WeaponRow({ id }: { id: string }) {
  const w = getWeapon(id);
  if (!w) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3 text-sm text-muted">
        {id} (keine Stats hinterlegt)
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-semibold">{w.name}</span>
        <Tag>{w.type}</Tag>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatBar label="Schaden" value={w.damage} max={80} />
        <StatBar label="Feuerrate" value={w.fireRate} max={1300} suffix="RPM" />
        <StatBar label="Mobilität" value={w.mobility} max={100} />
        <StatBar label="Magazin" value={w.magazine} max={60} />
      </div>
    </div>
  );
}

function Group({ title, ids }: { title: string; ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h4>
      <div className="flex flex-col gap-3">
        {ids.map((id) => (
          <WeaponRow key={id} id={id} />
        ))}
      </div>
    </div>
  );
}

export function LoadoutSection({ loadout }: { loadout: Loadout }) {
  return (
    <div className="flex flex-col gap-6">
      <Group title="Primärwaffen" ids={loadout.primary} />
      <Group title="Sekundärwaffen" ids={loadout.secondary} />
      {loadout.gadgets.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Gadgets
          </h4>
          <div className="flex flex-wrap gap-2">
            {loadout.gadgets.map((g) => (
              <Tag key={g}>{g}</Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
