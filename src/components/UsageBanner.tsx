import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { getAssessmentUsage } from "@/lib/assessment.functions";

/** Server-authoritative usage summary. The client never decides the limit. */
export function useAssessmentUsage() {
  const fetchUsage = useServerFn(getAssessmentUsage);
  return useQuery({
    queryKey: ["assessment-usage"],
    queryFn: () => fetchUsage(),
    staleTime: 30_000,
  });
}

export function UsageBanner() {
  const { data } = useAssessmentUsage();
  if (!data) return null;

  const { entitlement, remaining, windowResetsAt } = data;

  if (entitlement.tier === "pro") {
    return (
      <p className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-muted-foreground">
        Pro plan — unlimited assessments, up to {entitlement.roleLimit} target roles each.
      </p>
    );
  }

  const exhausted = (remaining ?? 0) <= 0;
  const resets = windowResetsAt
    ? new Date(windowResetsAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-hairline bg-surface px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {exhausted
          ? `You have used your free assessment for this month${resets ? ` — it renews ${resets}` : ""}.`
          : `Free plan — ${remaining} assessment left this month, 1 target role.`}
      </p>
      <Button asChild size="sm" variant={exhausted ? "default" : "outline"}>
        <Link to="/pricing">Upgrade for more</Link>
      </Button>
    </div>
  );
}
