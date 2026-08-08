import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "roadmap_progress",
  title: "Roadmap progress",
  description:
    "Summarise 90-day roadmap progress for the signed-in user: completed vs total items per 30-day block. Item text is encrypted and never returned.",
  inputSchema: {
    assessment_id: z
      .string()
      .describe("Optional assessment id from list_assessments. Defaults to the newest assessment.")
      .optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ assessment_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    let targetId = assessment_id;
    if (!targetId) {
      const { data, error } = await supabase
        .from("assessments")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      if (!data) return { content: [{ type: "text", text: "No assessments yet." }], isError: true };
      targetId = data.id;
    }

    const { data, error } = await supabase
      .from("roadmap_items")
      .select("block, done")
      .eq("user_id", userId)
      .eq("assessment_id", targetId);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const items = data ?? [];
    const blocks: Record<string, { total: number; done: number }> = {};
    for (const item of items) {
      const key = String(item.block);
      const bucket = blocks[key] ?? { total: 0, done: 0 };
      bucket.total += 1;
      if (item.done) bucket.done += 1;
      blocks[key] = bucket;
    }
    const summary = {
      assessment_id: targetId,
      total: items.length,
      done: items.filter((i) => i.done).length,
      by_block: blocks,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});