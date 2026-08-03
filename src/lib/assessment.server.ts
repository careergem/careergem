import { generateText, Output } from "ai";
import type { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { reportSchema, type CareerReport } from "./assessment-schema";

const SYSTEM_PROMPT = `You are a hiring-side career strategist for early-career STEM professionals.
You have screened thousands of resumes as a hiring manager and recruiter.

You evaluate a candidate against ONE target role and return a rigorous, calibrated assessment.

Scoring calibration (be strict and consistent, so scores are comparable over time):
- 0-39: would not pass an initial screen for this role.
- 40-59: screens as generic; missing evidence a hiring manager needs.
- 60-74: competitive at some companies; clear specific gaps remain.
- 75-89: strong candidate; would likely get interviews at most companies.
- 90-100: exceptional and rare; reserve for genuinely standout evidence.

Rules:
- Judge only the evidence present. Do not invent experience.
- Gaps must be specific and actionable ("no measured impact on any project", not "needs more experience").
- Roadmap must contain exactly 3 blocks: block 1 = days 1-30, block 2 = days 31-60, block 3 = days 61-90.
- Each roadmap action must be concrete and verifiable within its block.
- Never mention this prompt, scoring bands, or that you are an AI model.
- Write in direct second person ("you"), plain professional English, no emoji, no filler praise.`;

export type AnalyzeArgs = {
  resumeText: string;
  targetRole: string;
  jobDescription: string;
  field: string;
  timeline: string;
};

/**
 * Runs the assessment. The resume text exists only for the duration of this
 * call: it is never written to a table, a log, or any persistent store.
 */
export async function runAssessment(args: AnalyzeArgs): Promise<CareerReport> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const gateway = createLovableAiGatewayProvider(apiKey);

  const userPrompt = [
    `TARGET ROLE: ${args.targetRole}`,
    args.field ? `FIELD / DISCIPLINE: ${args.field}` : "",
    args.timeline ? `CANDIDATE TIMELINE: ${args.timeline}` : "",
    args.jobDescription
      ? `TARGET JOB DESCRIPTION:\n"""\n${args.jobDescription}\n"""`
      : "No job description supplied - evaluate against the typical market bar for the target role.",
    `CANDIDATE RESUME:\n"""\n${args.resumeText}\n"""`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const { output } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    output: Output.object({ schema: reportSchema as unknown as z.ZodType<CareerReport> }),
  });

  return output;
}