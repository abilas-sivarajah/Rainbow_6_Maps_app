"use client";

import type { LoadoutItem } from "@/data/types";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { AssetImage } from "./AssetImage";
import { StatBar, Tag } from "./ui";
import { asset } from "@/data/r6";

function WeaponRow({ item }: { item: LoadoutItem }) {
  const { weapons, t } = useLanguage();
  
  const w = weapons.find(x => x.name.toLowerCase() === item.name.toLowerCase());
  
  if (!w) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <AssetImage
          src={asset(item.image)}
          alt={item.name}
          className="h-8 w-14 shrink-0 object-contain"
        />
        <span className="font-semibold">{item.name}</span>
        {item.subtype && <span className="text-sm text-muted">{item.subtype}</span>}
      </div>
    );
  }

  return (
    <Link
      href={`/weapons?name=${encodeURIComponent(w.name)}`}
      className="group block rounded-lg border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AssetImage
            src={asset(item.image ?? w.image)}
            alt={w.name}
            className="h-8 w-16 shrink-0 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-semibold group-hover:text-accent transition-colors">{w.name}</span>
        </div>
        {w.type && <Tag>{w.type}</Tag>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {typeof w.damage === "number" && (
          <StatBar label={t("wp.damage")} value={w.damage} max={80} />
        )}
        {typeof w.rpm === "number" && (
          <StatBar label={t("wp.rpm")} value={w.rpm} max={1300} suffix="RPM" />
        )}
        {typeof w.mobility === "number" && (
          <StatBar label={t("wp.mobility")} value={w.mobility} max={100} />
        )}
        {w.magazine != null && (
          <div className="flex items-end justify-between text-sm">
            <span className="text-muted">{t("wp.magazine")}</span>
            <span className="font-semibold tabular-nums text-text">{w.magazine}</span>
          </div>
        )}
      </div>
      {w.fireModes && (
        <p className="mt-3 text-xs text-muted">{t("wp.fireModes")}: {w.fireModes}</p>
      )}
    </Link>
  );
}

function GadgetRow({ item }: { item: LoadoutItem }) {
  const { gadgets } = useLanguage();
  
  const g = gadgets.find(x => x.name.toLowerCase() === item.name.toLowerCase());
  const displayName = g?.name || item.name;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
      <AssetImage
        src={asset(item.image)}
        alt={displayName}
        className="h-10 w-10 shrink-0 object-contain"
      />
      <div className="min-w-0">
        <span className="font-medium">{displayName}</span>
        {g?.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>
        )}
      </div>
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
  const { t } = useLanguage();

  const primary = loadout.filter((l) => l.slot === "primary");
  const secondary = loadout.filter((l) => l.slot === "secondary");
  const gadgets = loadout.filter((l) => l.slot === "gadget");

  return (
    <div className="flex flex-col gap-6">
      <Group
        title={t("loadout.primary")}
        items={primary}
        render={(item) => <WeaponRow item={item} />}
      />
      <Group
        title={t("loadout.secondary")}
        items={secondary}
        render={(item) => <WeaponRow item={item} />}
      />
      <Group
        title={t("loadout.gadgets")}
        items={gadgets}
        render={(item) => <GadgetRow item={item} />}
      />
    </div>
  );
}
