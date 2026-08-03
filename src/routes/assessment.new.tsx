import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hasAccess, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { analyzeCareer } from "@/lib/assessment.functions";
import { seal } from "@/lib/crypto";

export const Route = createFileRoute("/assessment/new")({
  head: () => ({
    meta: [
      { title: "New assessment — CareerOS" },
      {
        name: "description",
        content:
          "Paste your resume and target role to get a calibrated career score, ranked gaps, and a 90-day roadmap.",
      },
      { property: "og:title", content: "New assessment — CareerOS" },
      { property: "og:description", content: "Get your career score, gaps, and 90-day plan." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AppShell>
      <NewAssessment />
    </AppShell>
  ),
});

function NewAssessment() {
  const { profile, vaultKey, session } = useAuth();
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeCareer);

  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState(profile?.target_role ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = !hasAccess(profile);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!vaultKey || !session) return;
    setBusy(true);
    setError(null);
    try {
      const report = await analyze({
        data: {
          resumeText,
          targetRole: targetRole.trim(),
          jobDescription,
          field: profile?.field ?? "",
          timeline: profile?.timeline ?? "",
        },
      });

      const sealed = await seal(vaultKey, report);
      const { data: inserted, error: insertError } = await supabase
        .from("assessments")
        .insert({
          user_id: session.user.id,
          ciphertext: sealed.ciphertext,
          iv: sealed.iv,
          score: report.score,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      const items = await Promise.all(
        report.roadmap.flatMap((block) =>
          block.actions.map(async (action, index) => {
            const sealedAction = await seal(vaultKey, { focus: block.focus, action });
            return {
              assessment_id: inserted.id,
              user_id: session.user.id,
              ciphertext: sealedAction.ciphertext,
              iv: sealedAction.iv,
              block: block.block,
              position: index,
            };
          }),
        ),
      );
      await supabase.from("roadmap_items").insert(items);

      await navigate({ to: "/assessment/$id", params: { id: inserted.id } });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The assessment could not be completed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">New assessment</h1>
      <p className="mt-3 text-muted-foreground">
        Everything you paste here is encrypted in your browser before it is saved. The text
        reaches the model once, in memory, and is never stored in readable form.
      </p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="target-role">Target role</Label>
          <Input
            id="target-role"
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume">Resume text</Label>
          <Textarea
            id="resume"
            rows={14}
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            required
            minLength={120}
            placeholder="Paste the full text of your resume…"
            aria-describedby="resume-hint"
          />
          <p id="resume-hint" className="text-xs text-muted-foreground">
            {resumeText.length} characters · at least 120 needed
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-description">Job description (optional)</Label>
          <Textarea
            id="job-description"
            rows={7}
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste a real posting to score against it directly."
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={busy || locked}>
          {busy ? "Analyzing… this takes ~30 seconds" : "Run assessment"}
        </Button>
        {locked ? (
          <p className="text-sm text-muted-foreground">
            Your trial has ended — subscribe to run new assessments.
          </p>
        ) : null}
      </form>
    </div>
  );
}