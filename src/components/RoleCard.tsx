import { Link } from "@tanstack/react-router";

import { gapTypeLabels, type RoleAssessment } from "@/lib/assessment-schema";
import { compRangeFor } from "@/lib/comp-ranges";

const impactTone: Record<string, string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

function Readiness({ now, target }: { now: number; target: number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Readiness</p>
      <p className="mt-1 font-mono text-2xl font-semibold">
        {now}/10 <span className="text-muted-foreground">→</span>{" "}
        <span className="text-signal">{target}/10</span>
      </p>
      <div
        className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-hairline"
        role="meter"
        aria-valuenow={now}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-label="Interview readiness today"
      >
        <div className="h-full rounded-full bg-data" style={{ width: `${now * 10}%` }} />
      </div>
    </div>
  );
}

export function RoleCard({
  role,
  showResources,
}: {
  role: RoleAssessment;
  showResources: boolean;
}) {
  const comp = compRangeFor(role.title);

  return (
    <section className="rounded-xl border border-hairline bg-surface p-7">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h3 className="font-display text-xl font-semibold">{role.title}</h3>
          <p className="mt-1.5 font-mono text-sm text-muted-foreground">
            Typical base in Canada: {comp.label}
          </p>
        </div>
        <Readiness now={role.readinessNow} target={role.readinessTarget} />
      </header>

      <div className="mt-7 grid gap-7 md:grid-cols-2">
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
            Top gaps
          </h4>
          <ol className="mt-4 space-y-4">
            {role.topGaps.map((gap, index) => (
              <li key={gap.title}>
                <p className="text-sm font-medium">
                  <span className="font-mono text-muted-foreground">{index + 1}.</span> {gap.title}{" "}
                  <span className={`ml-1 font-mono text-xs uppercase ${impactTone[gap.impact]}`}>
                    {gap.impact}
                  </span>
                  <span className="ml-2 rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                    {gapTypeLabels[gap.type]}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{gap.why}</p>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
            Action plan
          </h4>
          <ul className="mt-4 space-y-4">
            {role.actions.map((item) => (
              <li key={item.action}>
                <p className="text-sm font-medium">{item.action}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.why}</p>
                {showResources ? (
                  <p className="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                    {item.timeEstimate ? <span>{item.timeEstimate}</span> : null}
                    {item.resource ? (
                      <a
                        href={item.resource}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="underline underline-offset-4 hover:text-foreground"
                      >
                        {item.resource.replace(/^https?:\/\//, "")}
                      </a>
                    ) : null}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          {showResources ? null : (
            <p className="mt-4 text-xs text-muted-foreground">
              Resources, time estimates, and the full 5-action plan are part of Pro.{" "}
              <Link to="/pricing" className="underline underline-offset-4">
                Upgrade
              </Link>
            </p>
          )}
        </div>
      </div>

      <p className="mt-7 rounded-lg border border-signal/30 bg-surface-raised px-4 py-3 text-sm">
        {role.confidenceBuilder}
      </p>
    </section>
  );
}
