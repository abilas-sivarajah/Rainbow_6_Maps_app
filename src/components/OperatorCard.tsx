import Link from "next/link";
import Image from "next/image";
import type { Operator } from "@/data/types";
import { OperatorAvatar, SideBadge, Tag } from "./ui";

export function OperatorCard({ operator }: { operator: Operator }) {
  return (
    <Link
      href={`/operators/${operator.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
    >
      <div className="flex items-center gap-3">
        {operator.portrait ? (
          <Image
            src={operator.portrait}
            alt={operator.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-lg object-cover"
          />
        ) : (
          <OperatorAvatar name={operator.name} accent={operator.accent} />
        )}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">{operator.name}</h3>
          <p className="truncate text-sm text-muted">
            {operator.organization} · {operator.country}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SideBadge side={operator.side} />
        {operator.roles.map((r) => (
          <Tag key={r}>{r}</Tag>
        ))}
      </div>
      <p className="line-clamp-2 text-sm text-muted">{operator.gadget.name}</p>
    </Link>
  );
}
