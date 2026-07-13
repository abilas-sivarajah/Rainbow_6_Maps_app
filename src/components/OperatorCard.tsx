import Link from "next/link";
import type { Operator } from "@/data/types";
import { uniqueAbilityName, asset } from "@/data/r6";
import { AssetImage } from "./AssetImage";
import { FavButton } from "./FavButton";
import { OperatorAvatar, SideBadge, Tag } from "./ui";

export function OperatorCard({ operator }: { operator: Operator }) {
  const accent =
    operator.side === "attacker"
      ? "var(--color-attacker)"
      : "var(--color-defender)";
  const ability = uniqueAbilityName(operator);

  return (
    <Link
      href={`/operators/${operator.slug}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
    >
      <FavButton
        type="operator"
        id={operator.slug}
        className="absolute right-2 top-2"
      />
      <div className="flex items-center gap-3 pr-8">
        <AssetImage
          src={asset(operator.icon ?? operator.image)}
          alt={operator.name}
          className="h-14 w-14 shrink-0 rounded-lg bg-surface-2 object-cover object-top"
          fallback={<OperatorAvatar name={operator.name} accent={accent} />}
        />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">{operator.name}</h3>
          <p className="truncate text-sm text-muted">
            {operator.faction ?? operator.organization ?? "—"}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SideBadge side={operator.side} />
        {operator.roles.slice(0, 3).map((r) => (
          <Tag key={r}>{r}</Tag>
        ))}
      </div>
      {ability && (
        <p className="line-clamp-1 text-sm text-muted">★ {ability}</p>
      )}
    </Link>
  );
}
