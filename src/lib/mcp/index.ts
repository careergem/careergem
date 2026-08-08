import { auth, defineMcp } from "@lovable.dev/mcp-js";

import getProfileTool from "./tools/get-profile";
import listAssessmentsTool from "./tools/list-assessments";
import roadmapProgressTool from "./tools/roadmap-progress";
import setRoadmapItemDoneTool from "./tools/complete-roadmap-item";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// Supabase value that survives publish unchanged and Vite inlines it at build time.
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "careergem",
  title: "CareerGem",
  version: "0.1.0",
  instructions:
    "Tools for CareerGem, an AI career navigation app. Read the signed-in user's career profile, assessment score history, and 90-day roadmap progress, and mark roadmap items done. Resumes and assessment reports are encrypted in the user's browser and are never available here — only scores, dates, and completion state.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, listAssessmentsTool, roadmapProgressTool, setRoadmapItemDoneTool],
});