import type { CareerReport } from "./assessment-schema";

const RULE = "──────────────────────────────────";
const SITE = "https://careergem.lovable.app";

/**
 * Plain-text export of one role's plan. Contains only what the user chooses to
 * share and never the resume text.
 */
export function buildShareSnippet(
  report: CareerReport,
  roleIndex: number,
  assessmentId: string,
): string {
  const role = report.roles[roleIndex];
  if (!role) return "";

  const link = `${SITE}?utm_source=share&utm_assessment=${encodeURIComponent(assessmentId)}`;

  return [
    RULE,
    `CareerGem Roadmap: ${role.title}`,
    "",
    `My readiness: ${role.readinessNow}/10 → Target: ${role.readinessTarget}/10`,
    "",
    "Top gaps:",
    ...role.topGaps.map((gap) => `• ${gap.title}`),
    "",
    "My action plan:",
    ...role.actions.map((item) =>
      `• ${item.action}${item.timeEstimate ? ` (${item.timeEstimate})` : ""}`,
    ),
    "",
    link,
    RULE,
  ].join("\n");
}
