import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2.5 rounded-sm"
      aria-label="CareerGem home"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-md border border-signal/40 bg-signal/10 font-mono text-[13px] font-semibold text-signal transition-colors group-hover:bg-signal/20"
      >
        C
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight">
        Career<span className="text-signal">OS</span>
      </span>
    </Link>
  );
}