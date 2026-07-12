import type { Side } from "@/data/types";

/** Segmentierte Stat-Anzeige (z.B. Speed/Armor/Difficulty von 1–3). */
export function StatPips({
  label,
  value,
  max = 3,
  color = "var(--color-accent)",
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 w-6 rounded-sm"
            style={{ backgroundColor: i < value ? color : "var(--color-border)" }}
          />
        ))}
      </div>
    </div>
  );
}

/** Horizontaler Balken für kontinuierliche Werte (z.B. Waffen-Stats). */
export function StatBar({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold tabular-nums">
          {value}
          {suffix ? <span className="text-muted"> {suffix}</span> : null}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function SideBadge({ side }: { side: Side }) {
  const isAtk = side === "attacker";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        color: isAtk ? "var(--color-attacker)" : "var(--color-defender)",
        backgroundColor: isAtk
          ? "color-mix(in srgb, var(--color-attacker) 15%, transparent)"
          : "color-mix(in srgb, var(--color-defender) 15%, transparent)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: isAtk
            ? "var(--color-attacker)"
            : "var(--color-defender)",
        }}
      />
      {isAtk ? "Angreifer" : "Verteidiger"}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

/** Initialen-Avatar als Fallback, wenn kein Portrait vorhanden ist. */
export function OperatorAvatar({
  name,
  accent = "var(--color-accent)",
  size = 56,
}: {
  name: string;
  accent?: string;
  size?: number;
}) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-lg font-black text-bg"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(140deg, ${accent}, color-mix(in srgb, ${accent} 55%, #000))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
