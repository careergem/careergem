import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const betaFeedbackSchema = z.object({
  kind: z.enum(["useful", "issue", "idea", "other"]),
  message: z.string().trim().min(10, "Please share at least 10 characters.").max(2000),
  page: z.enum(["assessment_report", "settings"]).optional(),
});

/** Stores optional product feedback, never a resume or assessment report. */
export const submitBetaFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => betaFeedbackSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("beta_feedback").insert({
      user_id: context.userId,
      kind: data.kind,
      message: data.message,
      page: data.page ?? null,
    });
    if (error) throw new Error("We could not save that feedback. Please try again.");
    return { ok: true };
  });
