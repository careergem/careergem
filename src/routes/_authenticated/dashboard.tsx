import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your CareerOS dashboard" },
      {
        name: "description",
        content:
          "Your career score history, latest assessment, and roadmap progress — all decrypted locally in your browser.",
      },
      { property: "og:title", content: "Your CareerOS dashboard" },
      { property: "og:description", content: "Career score history and roadmap progress." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

type Row = { id: string; score: number | null; created_at: string };

function Dashboard() {
  const { session, profile } = useAuth();
  const userId = session?.user.id;

  const { data, isPending } = useQuery({
    queryKey: ["assessments", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Row[]> => {
      const { data: rows, error } = await supabase
        .from("assessments")
        .select("id, score, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (rows ?? []) as Row[];
    },
  });

  const rows = data ?? [];
  const latest = rows[0];
  const previous = rows[1];
  const delta =
    latest?.score != null && previous?.score != null ? latest.score - previous.score : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            {profile?.display_name ? `Hey ${profile.display_name}` : "Your dashboard"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {profile?.target_role
              ? `Tracking toward: ${profile.target_role}`
              : "Set a target role in settings to sharpen your scores."}
          </p>
        </div>
        <Button asChild>
          <Link to="/assessment/new">Run new assessment</Link>
        </Button>
      </div>

      {isPending ? (
        <p className="mt-12 text-sm text-muted-foreground" role="status">
          Loading your history…
        </p>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-xl border border-hairline bg-surface p-10 text-center">
          <h2 className="font-display text-xl font-semibold">No assessments yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Your first assessment takes about a minute: paste your resume, name the role, and
            get your score, gaps, and 90-day roadmap.
          </p>
          <Button asChild className="mt-7">
            <Link to="/assessment/new">Run my first assessment</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[auto_1fr]">
          <section className="rounded-xl border border-hairline bg-surface p-7">
            <h2 className="sr-only">Latest score</h2>
            <ScoreGauge score={latest?.score ?? 0} />
            {delta !== null ? (
              <p className="mt-5 font-mono text-sm text-muted-foreground">
                {delta >= 0 ? "+" : ""}
                {delta} vs previous assessment
              </p>
            ) : null}
            {latest ? (
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link to="/assessment/$id" params={{ id: latest.id }}>
                  Open latest report
                </Link>
              </Button>
            ) : null}
          </section>

          <section className="rounded-xl border border-hairline bg-surface p-7">
            <h2 className="font-display text-lg font-semibold">History</h2>
            <ul className="mt-5 divide-y divide-hairline">
              {rows.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="font-mono text-sm">
                      {new Date(row.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Encrypted · readable only in your browser
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
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
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}