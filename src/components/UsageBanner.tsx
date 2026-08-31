import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

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
        Early-access account — unlimited assessments, up to {entitlement.roleLimit} target roles
        each.
      </p>
    );
  }

  const exhausted = (remaining ?? 0) <= 0;
  const resets = windowResetsAt
    ? new Date(windowResetsAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {exhausted
          ? `You have used your public-beta assessment for this month${resets ? ` — it renews ${resets}` : ""}.`
          : `Public beta — ${remaining} private assessment left this month, 1 target role.`}
      </p>
    </div>
  );
}
