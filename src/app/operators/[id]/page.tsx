import type { Metadata } from "next";
import { operators, getOperator, uniqueAbilityName } from "@/data/r6";
import { OperatorDetailClient } from "@/components/OperatorDetailClient";

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

export default async function OperatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OperatorDetailClient id={id} />;
}
