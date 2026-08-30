import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { RolePicker } from "@/components/RolePicker";
import { useAssessmentUsage } from "@/components/UsageBanner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { commonGaps, experienceLevels, FREE_ROLE_LIMIT } from "@/lib/assessment-schema";
import { open, seal } from "@/lib/crypto";
import {
  emptyPersonalDetails,
  hasPersonalDetails,
  normalizePersonalDetails,
  type PersonalDetails,
} from "@/lib/personal-details";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your CareerGem profile" },
      {
        name: "description",
        content:
          "Tell CareerGem your field, target roles, experience level, and timeline so every assessment is scored against the jobs you actually want.",
      },
      { property: "og:title", content: "Set up your CareerGem profile" },
      {
        property: "og:description",
        content:
          "Field, target roles, experience, and timeline — the context behind every assessment.",
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

const graduationTimings = [
  "Graduating this year",
  "Graduating next year",
  "Graduating in 2+ years",
  "Recently graduated",
  "Already graduated",
];

function Onboarding() {
  const { profile, refreshProfile, vaultKey } = useAuth();
  const navigate = useNavigate();
  const { data: usage } = useAssessmentUsage();
  const roleLimit = usage?.entitlement.roleLimit ?? FREE_ROLE_LIMIT;

  const [field, setField] = useState(profile?.field ?? fields[0]!);
  const [roles, setRoles] = useState<string[]>(
    profile?.target_roles?.length
      ? profile.target_roles
      : profile?.target_role
        ? [profile.target_role]
        : [],
  );
  const [experience, setExperience] = useState(profile?.experience_level ?? "");
  const [gaps, setGaps] = useState<string[]>(profile?.known_gaps ?? []);
  const [timeline, setTimeline] = useState(profile?.timeline ?? timelines[0]!);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(emptyPersonalDetails);
  const [detailsLoaded, setDetailsLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPersonalDetails() {
      if (!vaultKey || !profile) return;
      if (!profile.personal_details_ciphertext || !profile.personal_details_iv) {
        if (active) {
          setPersonalDetails(emptyPersonalDetails);
          setDetailsLoaded(true);
        }
        return;
      }

      try {
        const opened = await open<PersonalDetails>(vaultKey, {
          ciphertext: profile.personal_details_ciphertext,
          iv: profile.personal_details_iv,
        });
        if (active) setPersonalDetails({ ...emptyPersonalDetails, ...opened });
      } catch {
        if (active) setError("Your optional personal details could not be decrypted.");
      } finally {
        if (active) setDetailsLoaded(true);
      }
    }

    void loadPersonalDetails();
    return () => {
      active = false;
    };
  }, [profile, vaultKey]);

  function toggleGap(gap: string) {
    setGaps((current) =>
      current.includes(gap)
        ? current.filter((item) => item !== gap)
        : [...current, gap].slice(0, 10),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!vaultKey) throw new Error("Unlock your vault before saving your profile.");
      const trimmed = roles
        .map((role) => role.trim())
        .filter(Boolean)
        .slice(0, 5);
      const normalizedDetails = normalizePersonalDetails(personalDetails);
      const sealedDetails = hasPersonalDetails(normalizedDetails)
        ? await seal(vaultKey, normalizedDetails)
        : null;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          field,
          target_roles: trimmed,
          target_role: trimmed[0] ?? "Software Engineer",
          experience_level: experience || null,
          known_gaps: gaps,
          timeline,
          personal_details_ciphertext: sealedDetails?.ciphertext ?? null,
          personal_details_iv: sealedDetails?.iv ?? null,
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
      <h1 className="mt-4 font-display text-3xl font-semibold">What are you aiming at?</h1>
      <p className="mt-3 text-muted-foreground">
        These answers set the bar your resume is scored against. Everything here is optional except
        your field, and it is stored in plain text so the app can use it as context — none of it is
        your resume.
      </p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-8">
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

        <div className="space-y-3">
          <Label htmlFor="target-roles">Target roles (optional)</Label>
          <RolePicker value={roles} onChange={setRoles} max={roleLimit} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience level (optional)</Label>
          <select
            id="experience"
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Prefer not to say</option>
            {experienceLevels.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Gaps you already suspect (optional)</legend>
          <div className="flex flex-wrap gap-2">
            {commonGaps.map((gap) => (
              <button
                key={gap}
                type="button"
                onClick={() => toggleGap(gap)}
                aria-pressed={gaps.includes(gap)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  gaps.includes(gap)
                    ? "border-signal/60 bg-surface-raised text-foreground"
                    : "border-hairline text-muted-foreground hover:text-foreground"
                }`}
              >
                {gap}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline (optional)</Label>
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

        <fieldset className="space-y-4 rounded-xl border border-hairline bg-surface p-5">
          <legend className="px-1 font-display text-base font-semibold">
            Private personal details
          </legend>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Optional context for you alone. These details are encrypted in your browser, never sent
            to the assessment model, and can be removed at any time.
          </p>
          <div className="space-y-2">
            <Label htmlFor="school">School or program (optional)</Label>
            <input
              id="school"
              value={personalDetails.school}
              onChange={(event) =>
                setPersonalDetails((current) => ({ ...current, school: event.target.value }))
              }
              maxLength={160}
              disabled={!detailsLoaded}
              placeholder="e.g. Computer Engineering diploma"
              className="h-10 w-full rounded-md border border-input bg-surface-raised px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduation">Graduation timing (optional)</Label>
            <select
              id="graduation"
              value={personalDetails.graduationTiming}
              onChange={(event) =>
                setPersonalDetails((current) => ({
                  ...current,
                  graduationTiming: event.target.value,
                }))
              }
              disabled={!detailsLoaded}
              className="h-10 w-full rounded-md border border-input bg-surface-raised px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
            >
              <option value="">Prefer not to say</option>
              {graduationTimings.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">Interests (optional)</Label>
            <Textarea
              id="interests"
              rows={3}
              value={personalDetails.interests}
              onChange={(event) =>
                setPersonalDetails((current) => ({ ...current, interests: event.target.value }))
              }
              maxLength={600}
              disabled={!detailsLoaded}
              placeholder="Projects, technical interests, communities, or anything you want to keep with your profile."
            />
          </div>
        </fieldset>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={busy || !detailsLoaded}>
          {busy ? "Saving…" : "Continue to assessment"}
        </Button>
      </form>
    </div>
  );
}
