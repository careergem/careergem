import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analyzeInputSchema, type CareerReport } from "./assessment-schema";
import { entitlementFor, type Entitlement } from "./entitlements";

/** Minimum gap between two assessments for one account, in milliseconds. */
const MIN_INTERVAL_MS = 60_000;
const WINDOW_MS = 30 * 86_400_000;

type Usage = {
  entitlement: Entitlement;
  used: number;
  remaining: number | null;
  windowResetsAt: string | null;
};

async function readUsage(
  supabase: { from: (table: string) => any },
  userId: string,
): Promise<Usage> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw new Error("Could not verify your account.");

  const entitlement = entitlementFor(profile?.plan);
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  const { data: rows, error: rowsError } = await supabase
    .from("assessments")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: true });
  if (rowsError) throw new Error("Could not check your assessment usage.");

  const used = rows?.length ?? 0;
  const oldest = rows?.[0]?.created_at as string | undefined;

  return {
    entitlement,
    used,
    remaining:
      entitlement.assessmentsPerMonth === null
        ? null
        : Math.max(0, entitlement.assessmentsPerMonth - used),
    windowResetsAt:
      entitlement.assessmentsPerMonth !== null && oldest
        ? new Date(new Date(oldest).getTime() + WINDOW_MS).toISOString()
        : null,
  };
}

/** What the signed-in account is allowed to do right now. Server is authoritative. */
export const getAssessmentUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => readUsage(context.supabase as never, context.userId));

/** Applies the free-tier ceiling to a generated report before it leaves the server. */
function applyTier(report: CareerReport, entitlement: Entitlement): CareerReport {
  const roles = report.roles.slice(0, entitlement.roleLimit).map((role) => ({
    ...role,
    actions: (entitlement.actionsPerRole
      ? role.actions.slice(0, entitlement.actionsPerRole)
      : role.actions
    ).map((action) =>
      entitlement.resources ? action : { ...action, resource: null, timeEstimate: null },
    ),
  }));
  return { ...report, roles };
}

/**
 * Generates a career assessment. Entitlement is verified server-side on every
 * call - never from browser state. Nothing from the resume is persisted here;
 * the browser encrypts the result before storing it.
 */
export const analyzeCareer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => analyzeInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const usage = await readUsage(supabase as never, userId);
    const { entitlement } = usage;

    if (usage.remaining !== null && usage.remaining <= 0) {
      throw new Error(
        "Your free plan includes one assessment a month. Upgrade to Pro for unlimited assessments.",
      );
    }

    const roles = data.targetRoles.slice(0, entitlement.roleLimit);
    if (data.targetRoles.length > entitlement.roleLimit) {
      throw new Error(
        `Your plan covers ${entitlement.roleLimit} target role${entitlement.roleLimit === 1 ? "" : "s"} per assessment.`,
      );
    }

    // Per-account rate limit. Bounds inference cost and blocks rapid-fire abuse
    // even for accounts that are within their quota.
    const { data: recent, error: recentError } = await supabase
      .from("assessments")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentError) throw new Error("Could not check your assessment usage.");

    if (recent) {
      const elapsed = Date.now() - new Date(recent.created_at).getTime();
      if (elapsed < MIN_INTERVAL_MS) {
        const wait = Math.ceil((MIN_INTERVAL_MS - elapsed) / 1000);
        throw new Error(`Please wait ${wait} seconds before running another assessment.`);
      }
    }

    const { runAssessment } = await import("./assessment.server");
    const report = await runAssessment({
      resumeText: data.resumeText,
      targetRoles: roles,
      jobDescription: data.jobDescription ?? "",
      field: data.field ?? "",
      timeline: data.timeline ?? "",
      experienceLevel: data.experienceLevel ?? "",
      knownGaps: data.knownGaps ?? [],
    });

    return { report: applyTier(report, entitlement), entitlement };
  });
