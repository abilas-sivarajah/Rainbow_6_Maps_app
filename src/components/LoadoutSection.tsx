import type { LoadoutItem } from "@/data/types";
import { getWeapon, getGadget } from "@/data/r6";
import { StatBar, Tag } from "./ui";

function WeaponRow({ item }: { item: LoadoutItem }) {
  const w = getWeapon(item.name);
  if (!w) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <span className="font-semibold">{item.name}</span>
        {item.subtype && <span className="ml-2 text-sm text-muted">{item.subtype}</span>}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-semibold">{w.name}</span>
        {w.type && <Tag>{w.type}</Tag>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {typeof w.damage === "number" && (
          <StatBar label="Schaden" value={w.damage} max={80} />
        )}
        {typeof w.rpm === "number" && (
          <StatBar label="Feuerrate" value={w.rpm} max={1300} suffix="RPM" />
        )}
        {typeof w.mobility === "number" && (
          <StatBar label="Mobilität" value={w.mobility} max={100} />
        )}
        {w.magazine != null && (
          <div className="flex items-end justify-between text-sm">
            <span className="text-muted">Magazin</span>
            <span className="font-semibold tabular-nums">{w.magazine}</span>
          </div>
        )}
      </div>
      {w.fireModes && (
        <p className="mt-3 text-xs text-muted">Feuermodi: {w.fireModes}</p>
      )}
    </div>
  );
}

function GadgetRow({ item }: { item: LoadoutItem }) {
  const g = getGadget(item.name);
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <span className="font-medium">{item.name}</span>
      {g?.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>
      )}
    </div>
  );
}

function Group({
  title,
  items,
  render,
}: {
  title: string;
  items: LoadoutItem[];
  render: (item: LoadoutItem) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h4>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={`${item.slot}-${item.name}`}>{render(item)}</div>
        ))}
      </div>
    </div>
  );
}

export function LoadoutSection({ loadout }: { loadout: LoadoutItem[] }) {
  const primary = loadout.filter((l) => l.slot === "primary");
  const secondary = loadout.filter((l) => l.slot === "secondary");
  const gadgets = loadout.filter((l) => l.slot === "gadget");

  return (
    <div className="flex flex-col gap-6">
      <Group
        title="Primärwaffen"
        items={primary}
        render={(item) => <WeaponRow item={item} />}
      />
      <Group
        title="Sekundärwaffen"
        items={secondary}
        render={(item) => <WeaponRow item={item} />}
      />
      <Group
        title="Gadgets"
        items={gadgets}
        render={(item) => <GadgetRow item={item} />}
      />
    </div>
  );
}
