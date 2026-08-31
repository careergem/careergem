import { useState } from "react";

import { Button } from "@/components/ui/button";
import { buildShareSnippet } from "@/lib/share-snippet";
import type { CareerReport } from "@/lib/assessment-schema";

/** Plain-text export of one role's plan. Nothing is posted anywhere. */
export function ShareSnippet({
  report,
  assessmentId,
}: {
  report: CareerReport;
  assessmentId: string;
}) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const snippet = buildShareSnippet(report, roleIndex, assessmentId);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setStatus("Copied to your clipboard.");
    } catch {
      setStatus("Copy failed — select the text and copy it manually.");
    }
  }

  async function share() {
    if (!navigator.share) {
      await copy();
      setStatus("Sharing is not available in this browser, so the text was copied instead.");
      return;
    }

    try {
      await navigator.share({ title: "My CareerGem roadmap", text: snippet });
      setStatus("Share sheet opened.");
    } catch (cause) {
      if ((cause as DOMException).name !== "AbortError") {
        setStatus("Share failed — try copying the text instead.");
      }
    }
  }

  function download() {
    const blob = new Blob([snippet], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "careergem-roadmap.txt";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded.");
  }

  return (
    <section className="rounded-xl border border-hairline bg-surface p-7">
      <h2 className="font-display text-lg font-semibold">Share your roadmap</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A plain-text summary of one role's plan. It contains no resume text — only the gaps and
        actions shown below.
      </p>

      {report.roles.length > 1 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {report.roles.map((role, index) => (
            <button
              key={role.title}
              type="button"
              onClick={() => setRoleIndex(index)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                index === roleIndex
                  ? "border-signal/60 bg-surface-raised text-foreground"
                  : "border-hairline text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={index === roleIndex}
            >
              {role.title}
            </button>
          ))}
        </div>
      ) : null}

      <label htmlFor="share-snippet" className="sr-only">
        Shareable roadmap text
      </label>
      <textarea
        id="share-snippet"
        readOnly
        rows={16}
        value={snippet}
        className="mt-5 w-full rounded-md border border-hairline bg-surface-raised p-4 font-mono text-xs leading-relaxed text-foreground"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" onClick={() => void share()}>
          Share safely
        </Button>
        <Button type="button" onClick={() => void copy()}>
          Copy text
        </Button>
        <Button type="button" variant="outline" onClick={download}>
          Download .txt
        </Button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 text-xs text-muted-foreground">
        {status}
      </p>
    </section>
  );
}
