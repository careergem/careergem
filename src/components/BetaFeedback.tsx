import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { submitBetaFeedback } from "@/lib/feedback.functions";
import { Button } from "@/components/ui/button";

type FeedbackKind = "useful" | "issue" | "idea" | "other";

export function BetaFeedback({ page }: { page: "assessment_report" | "settings" }) {
  const submit = useServerFn(submitBetaFeedback);
  const [kind, setKind] = useState<FeedbackKind>("useful");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (message.trim().length < 10) return;
    setSending(true);
    setStatus(null);
    try {
      await submit({ data: { kind, message: message.trim(), page } });
      setMessage("");
      setStatus("Thanks — your feedback helps shape the public beta.");
    } catch (cause) {
      setStatus(
        cause instanceof Error ? cause.message : "Feedback could not be saved. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      aria-labelledby="beta-feedback-heading"
      className="rounded-xl border border-hairline bg-surface p-7"
    >
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Public beta</p>
      <h2 id="beta-feedback-heading" className="mt-3 font-display text-lg font-semibold">
        Help us make the next assessment better
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        What was useful, confusing, or missing? Keep feedback general — do not paste your resume,
        assessment text, contact details, school, or other personal information here.
      </p>

      <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block text-sm">
          <span className="font-medium">Feedback type</span>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as FeedbackKind)}
            className="mt-2 h-10 w-full rounded-md border border-input bg-surface-raised px-3 text-sm"
          >
            <option value="useful">Something useful</option>
            <option value="issue">Something confusing or broken</option>
            <option value="idea">An idea or missing feature</option>
            <option value="other">Something else</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Your feedback</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            maxLength={2000}
            required
            placeholder="For example: I understood my top gap, but I wanted a clearer first action."
            className="mt-2 w-full resize-y rounded-md border border-input bg-surface-raised p-3 text-sm"
          />
        </label>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{message.trim().length}/2000</p>
          <Button type="submit" disabled={sending || message.trim().length < 10}>
            {sending ? "Sending…" : "Send beta feedback"}
          </Button>
        </div>
      </form>
      {status ? (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {status}
        </p>
      ) : null}
    </section>
  );
}
