import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { UsageBanner } from "@/components/UsageBanner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/assessments")({
  head: () => ({
    meta: [
      { title: "Assessment history — CareerGem" },
      {
        name: "description",
        content:
          "Every assessment you have run, newest first, with the score trend. Reports stay encrypted until you open them.",
      },
      { property: "og:title", content: "Assessment history — CareerGem" },
      { property: "og:description", content: "Your score trend over time." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AppShell>
      <History />
    </AppShell>
  ),
});

type Row = { id: string; score: number | null; role_count: number | null; created_at: string };

function History() {
  const { session } = useAuth();

  const { data, isPending } = useQuery({
    queryKey: ["assessments", session?.user.id],
    enabled: Boolean(session),
    queryFn: async (): Promise<Row[]> => {
      const { data: rows, error } = await supabase
        .from("assessments")
        .select("id, score, role_count, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (rows ?? []) as Row[];
    },
  });

  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Assessment history</h1>
        <Button asChild>
          <Link to="/assessment/new">Run new assessment</Link>
        </Button>
      </div>

      <div className="mt-6">
        <UsageBanner />
      </div>

      {isPending ? (
        <p className="mt-10 text-sm text-muted-foreground" role="status">
          Loading your history…
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-10 rounded-xl border border-hairline bg-surface p-8 text-sm text-muted-foreground">
          Nothing here yet. Your first assessment takes about a minute.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-hairline rounded-xl border border-hairline bg-surface px-7">
          {rows.map((row, index) => {
            const next = rows[index + 1];
            const delta =
              row.score != null && next?.score != null ? row.score - next.score : null;
            return (
              <li key={row.id} className="flex items-center justify-between gap-4 py-5">
                <div>
                  <p className="font-mono text-sm">
                    {new Date(row.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.role_count ? `${row.role_count} target role${row.role_count === 1 ? "" : "s"} · ` : ""}
                    encrypted · readable only in your browser
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {delta !== null ? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {delta >= 0 ? "+" : ""}
                      {delta}
                    </span>
                  ) : null}
                  <span className="font-mono text-xl font-semibold">{row.score ?? "—"}</span>
                  <Link
                    to="/assessment/$id"
                    params={{ id: row.id }}
                    className="text-sm underline underline-offset-4"
                  >
                    View
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
