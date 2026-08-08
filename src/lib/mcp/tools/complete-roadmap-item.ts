import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "set_roadmap_item_done",
  title: "Mark roadmap item done",
  description:
    "Mark one of the signed-in user's 90-day roadmap items as done or not done. Use roadmap_items ids seen in the CareerGem app.",
  inputSchema: {
    item_id: z.string().describe("The roadmap item id."),
    done: z.boolean().describe("True to mark complete, false to reopen."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ item_id, done }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("roadmap_items")
      .update({ done })
      .eq("id", item_id)
      .eq("user_id", ctx.getUserId())
      .select("id, block, position, done");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const row = data?.[0];
    if (!row) {
      return {
        content: [{ type: "text", text: "No roadmap item with that id belongs to you." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: `Roadmap item ${row.id} is now ${row.done ? "done" : "open"}.` }],
      structuredContent: { item: row },
    };
  },
});