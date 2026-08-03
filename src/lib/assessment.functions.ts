import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analyzeInputSchema } from "./assessment-schema";

const TRIAL_ASSESSMENT_LIMIT = 1;
const PAID_MONTHLY_LIMIT = 30;

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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan, trial_ends_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw new Error("Could not verify your account.");
    if (!profile) throw new Error("Your profile is not ready yet. Try again in a moment.");

    const trialActive = new Date(profile.trial_ends_at).getTime() > Date.now();
    const paid = profile.plan === "active";
    if (!paid && !trialActive) {
      throw new Error("Your free trial has ended. Subscribe to run more assessments.");
    }

    const since = paid
      ? new Date(Date.now() - 30 * 86400000).toISOString()
      : new Date(0).toISOString();

    const { count, error: countError } = await supabase
      .from("assessments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);

    if (countError) throw new Error("Could not check your assessment usage.");

    const limit = paid ? PAID_MONTHLY_LIMIT : TRIAL_ASSESSMENT_LIMIT;
    if ((count ?? 0) >= limit) {
      throw new Error(
        paid
          ? "You have reached this month's assessment limit."
          : "Your trial includes one assessment. Subscribe for unlimited re-assessments.",
      );
    }

    const { runAssessment } = await import("./assessment.server");
    return runAssessment({
      resumeText: data.resumeText,
      targetRole: data.targetRole,
      jobDescription: data.jobDescription ?? "",
      field: data.field ?? "",
      timeline: data.timeline ?? "",
    });
  });