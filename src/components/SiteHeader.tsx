import Link from "next/link";

const nav = [
  { href: "/operators", label: "Operator" },
  { href: "/maps", label: "Maps" },
  { href: "/weapons", label: "Waffen" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-accent font-black text-bg">
            R6
          </span>
          <span className="text-lg font-bold tracking-tight">
            Codex
            <span className="ml-1 text-xs font-medium uppercase tracking-widest text-muted">
              Siege
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 font-medium text-muted transition-colors hover:bg-surface hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
