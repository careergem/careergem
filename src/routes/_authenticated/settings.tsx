import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { SubscriptionPanel } from "@/components/SubscriptionPanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSignOut } from "@/hooks/useSignOut";
import { supabase } from "@/integrations/supabase/client";
import { open } from "@/lib/crypto";
import type { CareerReport } from "@/lib/assessment-schema";

import { z } from "zod";

const settingsSearchSchema = z.object({
  billing: z.enum(["success", "canceled"]).optional(),
});

export const Route = createFileRoute("/_authenticated/settings")({
  validateSearch: settingsSearchSchema,
  head: () => ({
    meta: [
      { title: "Settings — CareerOS" },
      {
        name: "description",
        content:
          "Manage your CareerOS account: see what is stored, export everything decrypted, or delete all of your data permanently.",
      },
      { property: "og:title", content: "Settings — CareerOS" },
      { property: "og:description", content: "Export or permanently delete your data." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AppShell>
      <Settings />
    </AppShell>
  ),
});

function Settings() {
  const { profile, session, vaultKey } = useAuth();
  const { billing } = Route.useSearch();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);

  async function handleExport() {
    if (!vaultKey) return;
    setStatus("Preparing your export…");
    const { data: rows } = await supabase
      .from("assessments")
      .select("id, score, created_at, ciphertext, iv")
      .order("created_at", { ascending: false });

    const reports = await Promise.all(
      (rows ?? []).map(async (row) => {
        try {
          return {
            id: row.id,
            created_at: row.created_at,
            report: await open<CareerReport>(vaultKey, {
              ciphertext: row.ciphertext,
              iv: row.iv,
            }),
          };
        } catch {
          return { id: row.id, created_at: row.created_at, report: null };
        }
      }),
    );

    const blob = new Blob(
      [JSON.stringify({ profile: { display_name: profile?.display_name }, reports }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "careeros-export.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Export downloaded.");
  }

  async function handleDeleteAll() {
    if (!session) return;
    if (!window.confirm("Permanently delete all assessments and roadmap items? This cannot be undone.")) {
      return;
    }
    setStatus("Deleting…");
    await supabase.from("roadmap_items").delete().eq("user_id", session.user.id);
    await supabase.from("assessments").delete().eq("user_id", session.user.id);
    setStatus("All of your assessment data has been deleted.");
    await navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="mt-3 text-muted-foreground">
          What we hold for you, and how to take it back.
        </p>
      </div>

      <section className="rounded-xl border border-hairline bg-surface p-7">
        <h2 className="font-display text-lg font-semibold">Account</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-mono">{session?.user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{profile?.display_name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Plan</dt>
            <dd>{profile?.plan === "active" ? "Subscribed" : "Trial"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Target role</dt>
            <dd>{profile?.target_role ?? "—"}</dd>
          </div>
        </dl>
        <p className="mt-5 text-xs text-muted-foreground">
          Everything else — resumes, reports, roadmap text — is stored encrypted and is
          unreadable without your password.
        </p>
      </section>

      <SubscriptionPanel billingFlag={billing} />

      <section className="rounded-xl border border-hairline bg-surface p-7">
        <h2 className="font-display text-lg font-semibold">Your data</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => void handleExport()}>
            Export everything (decrypted)
          </Button>
          <Button variant="destructive" onClick={() => void handleDeleteAll()}>
            Delete all assessments
          </Button>
        </div>
        {status ? (
          <p role="status" className="mt-4 text-sm text-muted-foreground">
            {status}
          </p>
        ) : null}
      </section>

      <Button variant="ghost" onClick={() => void signOut()}>
        Sign out
      </Button>
    </div>
  );
}