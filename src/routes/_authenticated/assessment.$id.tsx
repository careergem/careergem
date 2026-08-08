import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { RoleCard } from "@/components/RoleCard";
import { ScoreGauge, SubScoreBar } from "@/components/ScoreGauge";
import { ShareSnippet } from "@/components/ShareSnippet";
import { useAssessmentUsage } from "@/components/UsageBanner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { gapTypeLabels, subScoreLabels, type CareerReport } from "@/lib/assessment-schema";
import { open } from "@/lib/crypto";

export const Route = createFileRoute("/_authenticated/assessment/$id")({
  head: () => ({
    meta: [
      { title: "Assessment report — CareerGem" },
      {
        name: "description",
        content:
          "Your decrypted assessment: readiness per target role, ranked gaps, compensation context, and your action plan.",
      },
      { property: "og:title", content: "Assessment report — CareerGem" },
      { property: "og:description", content: "Readiness, gaps, and your action plan." },
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

type RoadmapRow = {
  id: string;
  block: number;
  position: number;
  done: boolean;
  focus: string;
  action: string;
};

function ReportView() {
  const { id } = Route.useParams();
  const { vaultKey } = useAuth();
  const queryClient = useQueryClient();
  const { data: usage } = useAssessmentUsage();
  const entitlement = usage?.entitlement;

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

  const { data: roadmap } = useQuery({
    queryKey: ["roadmap", id],
    enabled: Boolean(vaultKey),
    queryFn: async (): Promise<RoadmapRow[]> => {
      const { data: rows, error: queryError } = await supabase
        .from("roadmap_items")
        .select("id, block, position, done, ciphertext, iv")
        .eq("assessment_id", id)
        .order("block", { ascending: true })
        .order("position", { ascending: true });
      if (queryError) throw queryError;
      const opened = await Promise.all(
        (rows ?? []).map(async (row) => {
          try {
            const payload = await open<{ focus: string; action: string }>(vaultKey!, {
              ciphertext: row.ciphertext,
              iv: row.iv,
            });
            return { ...row, ...payload };
          } catch {
            return null;
          }
        }),
      );
      return opened.filter(Boolean) as RoadmapRow[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ itemId, done }: { itemId: string; done: boolean }) => {
      const { error: updateError } = await supabase
        .from("roadmap_items")
        .update({ done })
        .eq("id", itemId);
      if (updateError) throw updateError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roadmap", id] }),
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

  const blocks = [1, 2, 3].map((block) => ({
    block,
    items: (roadmap ?? []).filter((item) => item.block === block),
  }));

  return (
    <article className="space-y-10">
      <header className="grid gap-8 rounded-xl border border-hairline bg-surface p-7 md:grid-cols-[auto_1fr]">
        <ScoreGauge score={data.score} />
        <div>
          <h1 className="font-display text-2xl font-semibold">{data.headline}</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">{data.summary}</p>
          {data.extracted.yearsExperience !== null || data.extracted.senioritySignal ? (
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              {data.extracted.yearsExperience !== null
                ? `${data.extracted.yearsExperience} yrs evidenced`
                : null}
              {data.extracted.yearsExperience !== null && data.extracted.senioritySignal ? " · " : null}
              {data.extracted.senioritySignal}
            </p>
          ) : null}
        </div>
      </header>

      <section>
        <h2 className="font-display text-2xl font-semibold">Target roles</h2>
        <div className="mt-6 space-y-6">
          {data.roles.map((role) => (
            <RoleCard key={role.title} role={role} showResources={entitlement?.resources ?? false} />
          ))}
        </div>
      </section>

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
          {data.extracted.technologies.length ? (
            <p className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground">
              Read from your resume: {data.extracted.technologies.join(", ")}
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-7">
          <h2 className="font-display text-lg font-semibold">Gaps, ranked by impact</h2>
          <ul className="mt-5 space-y-5">
            {data.gaps.map((gap) => (
              <li key={gap.title}>
                <p className="flex flex-wrap items-baseline gap-2 font-medium">
                  {gap.title}
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider ${impactTone[gap.impact]}`}
                  >
                    {gap.impact}
                  </span>
                  <span className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                    {gapTypeLabels[gap.type]}
                  </span>
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{gap.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Your 90-day plan</h2>
          {entitlement?.progressTracking ? (
            <p className="text-sm text-muted-foreground">
              Tick items as you finish them, then re-assess in two weeks.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Progress tracking is part of Pro.{" "}
              <Link to="/pricing" className="underline underline-offset-4">
                Upgrade
              </Link>
            </p>
          )}
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {blocks.map(({ block, items }) => (
            <div key={block} className="rounded-xl border border-hairline bg-surface p-7">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
                Days {(block - 1) * 30 + 1}–{block * 30}
              </p>
              <h3 className="mt-3 font-display text-lg font-semibold">
                {items[0]?.focus ?? data.roadmap.find((entry) => entry.block === block)?.focus}
              </h3>
              <ul className="mt-4 space-y-3">
                {(items.length
                  ? items
                  : (data.roadmap.find((entry) => entry.block === block)?.actions ?? []).map(
                      (action, index) => ({
                        id: `${block}-${index}`,
                        block,
                        position: index,
                        done: false,
                        focus: "",
                        action,
                      }),
                    )
                ).map((item) => (
                  <li key={item.id} className="flex gap-3 text-sm">
                    {entitlement?.progressTracking && items.length ? (
                      <label className="flex cursor-pointer gap-3">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={(event) =>
                            toggle.mutate({ itemId: item.id, done: event.target.checked })
                          }
                          className="mt-0.5 size-4 shrink-0 accent-[oklch(0.72_0.15_215)]"
                        />
                        <span className={item.done ? "text-muted-foreground line-through" : ""}>
                          {item.action}
                        </span>
                      </label>
                    ) : (
                      <>
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-data"
                        />
                        <span className="text-muted-foreground">{item.action}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <ShareSnippet report={data} assessmentId={id} />
    </article>
  );
}
