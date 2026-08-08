import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { RolePicker } from "@/components/RolePicker";
import { UsageBanner, useAssessmentUsage } from "@/components/UsageBanner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FREE_ROLE_LIMIT } from "@/lib/assessment-schema";
import { analyzeCareer } from "@/lib/assessment.functions";
import { seal } from "@/lib/crypto";
import { ACCEPTED_RESUME_TYPES, extractResumeText } from "@/lib/resume-extract";

export const Route = createFileRoute("/_authenticated/assessment/new")({
  head: () => ({
    meta: [
      { title: "New assessment — CareerGem" },
      {
        name: "description",
        content:
          "Upload or paste your resume and name your target roles to get readiness scores, ranked gaps, and a specific action plan.",
      },
      { property: "og:title", content: "New assessment — CareerGem" },
      { property: "og:description", content: "Readiness scores, ranked gaps, and your action plan." },
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
  const queryClient = useQueryClient();
  const analyze = useServerFn(analyzeCareer);
  const { data: usage } = useAssessmentUsage();
  const fileInput = useRef<HTMLInputElement>(null);

  const roleLimit = usage?.entitlement.roleLimit ?? FREE_ROLE_LIMIT;
  const outOfQuota = usage ? usage.remaining !== null && usage.remaining <= 0 : false;

  const [resumeText, setResumeText] = useState("");
  const [fileStatus, setFileStatus] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>(
    (profile?.target_roles?.length
      ? profile.target_roles
      : profile?.target_role
        ? [profile.target_role]
        : []
    ).slice(0, roleLimit),
  );
  const [jobDescription, setJobDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setFileStatus(`Reading ${file.name}…`);
    try {
      const text = await extractResumeText(file);
      if (text.length < 120) {
        throw new Error("We could not read enough text from that file. Paste the text instead.");
      }
      setResumeText(text);
      setFileStatus(`Loaded ${file.name} — review the text below before running.`);
    } catch (cause) {
      setFileStatus(null);
      setError(cause instanceof Error ? cause.message : "That file could not be read.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!vaultKey || !session) return;
    setBusy(true);
    setError(null);
    try {
      const targetRoles = (roles.length ? roles : ["Software Engineer"]).slice(0, roleLimit);

      const { report } = await analyze({
        data: {
          resumeText,
          targetRoles,
          jobDescription,
          field: profile?.field ?? "",
          timeline: profile?.timeline ?? "",
          experienceLevel: profile?.experience_level ?? "",
          knownGaps: profile?.known_gaps ?? [],
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
          role_count: report.roles.length,
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

      await queryClient.invalidateQueries({ queryKey: ["assessment-usage"] });
      await queryClient.invalidateQueries({ queryKey: ["assessments"] });
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
        Your resume is read in this tab and encrypted in your browser before anything is saved. The
        text reaches the assessment once, in memory, and is never stored in readable form.
      </p>

      <div className="mt-6">
        <UsageBanner />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-7">
        <div className="space-y-3">
          <Label htmlFor="target-roles">Target roles</Label>
          <RolePicker value={roles} onChange={setRoles} max={roleLimit} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume-file">Upload your resume (PDF, DOCX, or text)</Label>
          <input
            ref={fileInput}
            id="resume-file"
            type="file"
            accept={ACCEPTED_RESUME_TYPES}
            onChange={(event) => void handleFile(event.target.files?.[0])}
            className="block w-full cursor-pointer rounded-md border border-hairline bg-surface p-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-surface-raised file:px-3 file:py-1.5 file:text-sm file:text-foreground"
            aria-describedby="resume-file-hint"
          />
          <p id="resume-file-hint" role="status" aria-live="polite" className="text-xs text-muted-foreground">
            {fileStatus ?? "The file stays on your device — only the extracted text is used."}
          </p>
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
            placeholder="Paste the full text of your resume, or upload a file above…"
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

        <Button type="submit" size="lg" disabled={busy || outOfQuota} aria-busy={busy}>
          {busy ? "Assessing… this takes ~30 seconds" : "Run assessment"}
        </Button>
        <p role="status" aria-live="polite" className="sr-only">
          {busy ? "Assessing your resume. This usually takes about 30 seconds." : ""}
        </p>
      </form>
    </div>
  );
}
