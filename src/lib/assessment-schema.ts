import { z } from "zod";

export const impactLevels = ["high", "medium", "low"] as const;
export const gapTypes = ["technical", "credential", "pattern", "confidence"] as const;

export const experienceLevels = [
  "Transitioning into tech",
  "0-2 years",
  "2-5 years",
  "5+ years",
] as const;

export const commonGaps = [
  "Interview skills",
  "System design",
  "Frontend React",
  "Cloud platforms",
  "Data structures & algorithms",
  "Testing",
  "Infrastructure / DevOps",
  "Portfolio projects",
] as const;

/** Free plans see three actions with no resources or time estimates. */
export const FREE_ACTIONS_PER_ROLE = 3;
export const FREE_ROLE_LIMIT = 1;
export const PRO_ROLE_LIMIT = 5;

export const roleAssessmentSchema = z.object({
  title: z.string(),
  readinessNow: z.number().int().min(1).max(10),
  readinessTarget: z.number().int().min(1).max(10),
  topGaps: z
    .array(
      z.object({
        title: z.string(),
        type: z.enum(gapTypes),
        impact: z.enum(impactLevels),
        why: z.string(),
      }),
    )
    .min(1)
    .max(3),
  actions: z
    .array(
      z.object({
        action: z.string(),
        why: z.string(),
        resource: z.string().nullable(),
        timeEstimate: z.string().nullable(),
      }),
    )
    .min(3)
    .max(5),
  confidenceBuilder: z.string(),
});

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
  extracted: z.object({
    yearsExperience: z.number().nullable(),
    senioritySignal: z.string().nullable(),
    skills: z.array(z.string()).max(24),
    technologies: z.array(z.string()).max(24),
  }),
  strengths: z.array(z.string()).min(1).max(6),
  gaps: z
    .array(
      z.object({
        title: z.string(),
        type: z.enum(gapTypes),
        impact: z.enum(impactLevels),
        why: z.string(),
      }),
    )
    .min(2)
    .max(8),
  roles: z.array(roleAssessmentSchema).min(1).max(5),
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
export type RoleAssessment = z.infer<typeof roleAssessmentSchema>;

export const subScoreLabels: Record<keyof CareerReport["subScores"], string> = {
  technicalDepth: "Technical depth",
  evidenceOfImpact: "Evidence of impact",
  credibilitySignals: "Credibility signals",
  marketAlignment: "Market alignment",
  presentation: "Presentation",
};

export const gapTypeLabels: Record<(typeof gapTypes)[number], string> = {
  technical: "Technical",
  credential: "Credential",
  pattern: "Pattern",
  confidence: "Confidence",
};

export const analyzeInputSchema = z.object({
  resumeText: z.string().min(120).max(20000),
  targetRoles: z.array(z.string().min(2).max(160)).min(1).max(PRO_ROLE_LIMIT),
  jobDescription: z.string().max(20000).optional().default(""),
  field: z.string().max(120).optional().default(""),
  timeline: z.string().max(120).optional().default(""),
  experienceLevel: z.string().max(60).optional().default(""),
  knownGaps: z.array(z.string().max(80)).max(10).optional().default([]),
});
