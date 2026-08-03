import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { ScoreGauge, SubScoreBar } from "@/components/ScoreGauge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { subScoreLabels, type CareerReport } from "@/lib/assessment-schema";
import { open } from "@/lib/crypto";

export const Route = createFileRoute("/assessment/$id")({
  head: () => ({
    meta: [
      { title: "Assessment report — CareerOS" },
      {
        name: "description",
        content:
          "Your decrypted career assessment: score, sub-scores, ranked gaps, and your 90-day roadmap.",
      },
      { property: "og:title", content: "Assessment report — CareerOS" },
      { property: "og:description", content: "Score, gaps, and your 90-day roadmap." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AppShell>
      <ReportView />
    </AppShell>
  ),
});

const impactTone: Record<string, string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

function ReportView() {
  const { id } = Route.useParams();
  const { vaultKey } = useAuth();

  const { data, isPending, error } = useQuery({
    queryKey: ["assessment", id],
    enabled: Boolean(vaultKey),
    queryFn: async (): Promise<CareerReport> => {
      const { data: row, error: queryError } = await supabase
        .from("assessments")
        .select("ciphertext, iv")
        .eq("id", id)
        .single();
      if (queryError) throw queryError;
      return open<CareerReport>(vaultKey!, { ciphertext: row.ciphertext, iv: row.iv });
    },
  });

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Decrypting your report locally…
      </p>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-hairline bg-surface p-8">
        <h1 className="font-display text-xl font-semibold">This report could not be opened</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          It was encrypted with a different password, or it no longer exists.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="space-y-10">
      <header className="grid gap-8 rounded-xl border border-hairline bg-surface p-7 md:grid-cols-[auto_1fr]">
        <ScoreGauge score={data.score} />
        <div>
          <h1 className="font-display text-2xl font-semibold">{data.headline}</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">{data.summary}</p>
        </div>
      </header>

      <section className="rounded-xl border border-hairline bg-surface p-7">
        <h2 className="font-display text-lg font-semibold">Breakdown</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {(Object.keys(subScoreLabels) as Array<keyof CareerReport["subScores"]>).map((key) => (
            <SubScoreBar key={key} label={subScoreLabels[key]} value={data.subScores[key]} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-surface p-7">
          <h2 className="font-display text-lg font-semibold">What is working</h2>
          <ul className="mt-5 space-y-3">
            {data.strengths.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-7">
          <h2 className="font-display text-lg font-semibold">Gaps, ranked by impact</h2>
          <ul className="mt-5 space-y-5">
            {data.gaps.map((gap) => (
              <li key={gap.title}>
                <p className="flex items-baseline gap-2 font-medium">
                  {gap.title}
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider ${impactTone[gap.impact]}`}
                  >
                    {gap.impact}
                  </span>
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{gap.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">Your 90-day roadmap</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {data.roadmap.map((block) => (
            <div key={block.block} className="rounded-xl border border-hairline bg-surface p-7">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
                Days {(block.block - 1) * 30 + 1}–{block.block * 30}
              </p>
              <h3 className="mt-3 font-display text-lg font-semibold">{block.focus}</h3>
              <ul className="mt-4 space-y-3">
                {block.actions.map((action) => (
                  <li key={action} className="flex gap-3 text-sm text-muted-foreground">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-data" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}