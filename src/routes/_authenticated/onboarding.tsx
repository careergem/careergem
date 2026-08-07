import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your CareerOS profile" },
      {
        name: "description",
        content:
          "Tell CareerOS your field, target role, and timeline so every assessment is scored against the job you actually want.",
      },
      { property: "og:title", content: "Set up your CareerOS profile" },
      {
        property: "og:description",
        content: "Field, target role, and timeline — the context behind every assessment.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AppShell>
      <Onboarding />
    </AppShell>
  ),
});

const fields = [
  "Software engineering",
  "Data science / ML",
  "Electrical / hardware",
  "Mechanical engineering",
  "Civil / structural",
  "Biotech / life sciences",
  "Other STEM",
];

const timelines = [
  "Actively applying now",
  "Within 3 months",
  "Within 6 months",
  "Exploring for later",
];

function Onboarding() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [field, setField] = useState(profile?.field ?? fields[0]!);
  const [targetRole, setTargetRole] = useState(profile?.target_role ?? "");
  const [timeline, setTimeline] = useState(profile?.timeline ?? timelines[0]!);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          field,
          target_role: targetRole.trim(),
          timeline,
          onboarding_complete: true,
        })
        .eq("id", profile!.id);
      if (updateError) throw updateError;
      await refreshProfile();
      await navigate({ to: "/assessment/new" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">Step 1 of 2</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">
        What are you aiming at?
      </h1>
      <p className="mt-3 text-muted-foreground">
        These three answers set the bar your resume is scored against. They are stored in plain
        text so the app can use them as context — nothing here is your resume.
      </p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Your field</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors ${
                  field === option
                    ? "border-signal/60 bg-surface-raised"
                    : "border-hairline bg-surface hover:border-signal/30"
                }`}
              >
                <input
                  type="radio"
                  name="field"
                  value={option}
                  checked={field === option}
                  onChange={() => setField(option)}
                  className="size-4 accent-[oklch(0.72_0.15_215)]"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="target-role">Target role</Label>
          <Input
            id="target-role"
            placeholder="e.g. Backend Engineer at a mid-size SaaS company"
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            required
            aria-describedby="target-role-hint"
          />
          <p id="target-role-hint" className="text-xs text-muted-foreground">
            Be specific. "Engineer" scores worse than "Backend Engineer, Go, fintech".
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline</Label>
          <select
            id="timeline"
            value={timeline}
            onChange={(event) => setTimeline(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {timelines.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Saving…" : "Continue to assessment"}
        </Button>
      </form>
    </div>
  );
}