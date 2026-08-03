import { z } from "zod";

export const impactLevels = ["high", "medium", "low"] as const;

export const reportSchema = z.object({
  score: z.number().int().min(0).max(100),
  headline: z.string(),
  summary: z.string(),
  subScores: z.object({
    technicalDepth: z.number().int().min(0).max(100),
    evidenceOfImpact: z.number().int().min(0).max(100),
    credibilitySignals: z.number().int().min(0).max(100),
    marketAlignment: z.number().int().min(0).max(100),
    presentation: z.number().int().min(0).max(100),
  }),
  strengths: z.array(z.string()).min(1).max(6),
  gaps: z
    .array(
      z.object({
        title: z.string(),
        impact: z.enum(impactLevels),
        why: z.string(),
      }),
    )
    .min(2)
    .max(8),
  roadmap: z
    .array(
      z.object({
        block: z.number().int().min(1).max(3),
        focus: z.string(),
        actions: z.array(z.string()).min(2).max(6),
      }),
    )
    .min(3)
    .max(3),
});

export type CareerReport = z.infer<typeof reportSchema>;

export const subScoreLabels: Record<keyof CareerReport["subScores"], string> = {
  technicalDepth: "Technical depth",
  evidenceOfImpact: "Evidence of impact",
  credibilitySignals: "Credibility signals",
  marketAlignment: "Market alignment",
  presentation: "Presentation",
};

export const analyzeInputSchema = z.object({
  resumeText: z.string().min(120).max(20000),
  targetRole: z.string().min(2).max(160),
  jobDescription: z.string().max(20000).optional().default(""),
  field: z.string().max(120).optional().default(""),
  timeline: z.string().max(120).optional().default(""),
});