import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { operators, getOperator, uniqueAbilityName, asset } from "@/data/r6";
import { LoadoutSection } from "@/components/LoadoutSection";
import { AssetImage } from "@/components/AssetImage";
import { OperatorAvatar, SideBadge, StatPips, Tag } from "@/components/ui";

export function generateStaticParams() {
  return operators.map((o) => ({ id: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const op = getOperator(id);
  if (!op) return { title: "Operator nicht gefunden · R6 Codex" };
  const ability = uniqueAbilityName(op);
  return {
    title: `${op.name} · R6 Codex`,
    description: `${op.name}${op.faction ? ` (${op.faction})` : ""}${
      ability ? ` – ${ability}` : ""
    }. Stats, Fähigkeit und Loadout.`,
  };
}

export default async function OperatorDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const op = getOperator(id);
  if (!op) notFound();

  const pipColor =
    op.side === "attacker" ? "var(--color-attacker)" : "var(--color-defender)";
  const ability = uniqueAbilityName(op) ?? op.ability;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/operators"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      >
        ← Zurück zu allen Operatorn
      </Link>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Übersicht */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-4">
              <AssetImage
                src={asset(op.image ?? op.icon)}
                alt={op.name}
                className="h-20 w-20 shrink-0 rounded-lg bg-surface-2 object-cover object-top"
                fallback={<OperatorAvatar name={op.name} accent={pipColor} size={72} />}
              />
              <div>
                <h1 className="text-3xl font-black">{op.name}</h1>
                {op.realName && (
                  <p className="text-sm text-muted">{op.realName}</p>
                )}
                <p className="text-sm text-muted">
                  {[op.faction, op.placeOfBirth].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <SideBadge side={op.side} />
              {op.roles.map((r) => (
                <Tag key={r}>{r}</Tag>
              ))}
            </div>
            {op.quote && (
              <p className="text-sm italic text-muted">{op.quote}</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              Stats
            </h2>
            <div className="flex flex-col gap-3">
              <StatPips label="Geschwindigkeit" value={op.speed} color={pipColor} />
              <StatPips label="Rüstung" value={op.armor} color={pipColor} />
              <StatPips
                label="Schwierigkeit"
                value={op.difficulty}
                color={pipColor}
              />
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted">Gesundheit</span>
                <span className="font-bold tabular-nums">{op.health} HP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fähigkeit + Loadout */}
        <div className="flex flex-col gap-8">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Spezialfähigkeit
            </h2>
            <h3 className="mb-2 text-2xl font-bold">{ability}</h3>
            {op.abilityDescription && (
              <p className="whitespace-pre-line text-muted">
                {op.abilityDescription}
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold">Loadout</h2>
            <LoadoutSection loadout={op.loadout} />
          </div>
        </div>
      </div>
    </div>
  );
}
