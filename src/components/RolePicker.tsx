import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "Software Engineer",
  "Backend Engineer",
  "Full-stack Developer",
  "Frontend Engineer",
  "Data Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "QA / Automation Engineer",
  "Embedded / Firmware Engineer",
];

export function RolePicker({
  value,
  onChange,
  max,
  id = "target-roles",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  id?: string;
}) {
  const [draft, setDraft] = useState("");
  const full = value.length >= max;

  function add(role: string) {
    const trimmed = role.trim();
    if (!trimmed || full) return;
    if (value.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
  }

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-2" aria-label="Selected target roles">
        {value.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            No role chosen — we will assess you as a general Software Engineer.
          </li>
        ) : (
          value.map((role) => (
            <li key={role}>
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== role))}
                className="flex items-center gap-2 rounded-full border border-signal/60 bg-surface-raised px-3 py-1.5 text-sm"
              >
                {role}
                <span aria-hidden="true">×</span>
                <span className="sr-only">Remove {role}</span>
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          disabled={full}
          placeholder="Add a role, e.g. Backend Engineer"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(draft);
              setDraft("");
            }
          }}
          aria-describedby={`${id}-hint`}
        />
        <Button
          type="button"
          variant="outline"
          disabled={full || !draft.trim()}
          onClick={() => {
            add(draft);
            setDraft("");
          }}
        >
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.filter((role) => !value.includes(role)).map((role) => (
          <button
            key={role}
            type="button"
            disabled={full}
            onClick={() => add(role)}
            className="rounded-full border border-hairline px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-signal/40 hover:text-foreground disabled:opacity-40"
          >
            + {role}
          </button>
        ))}
      </div>

      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        Up to {max} role{max === 1 ? "" : "s"} on your plan.
      </p>
    </div>
  );
}
