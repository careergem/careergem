import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_assessments",
  title: "List career assessments",
  description:
    "List the signed-in user's career assessments with their score and date, newest first. Report contents stay encrypted and are never returned.",
  inputSchema: {
    limit: z.number().int().describe("How many assessments to return (1-50). Defaults to 10.").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(limit ?? 10, 1), 50);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("assessments")
      .select("id, score, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(take);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const items = data ?? [];
    return {
      content: [
        {
          type: "text",
          text: items.length
            ? JSON.stringify(items, null, 2)
            : "No assessments yet. Run one in the CareerGem app.",
        },
      ],
      structuredContent: { assessments: items },
    };
  },
});