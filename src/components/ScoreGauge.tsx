const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function band(score: number) {
  if (score >= 75) return { label: "Strong", tone: "text-success" };
  if (score >= 60) return { label: "Competitive", tone: "text-signal" };
  if (score >= 40) return { label: "Generic", tone: "text-warning" };
  return { label: "Below screen", tone: "text-destructive" };
}

export function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const dash = (clamped / 100) * CIRCUMFERENCE;
  const { label, tone } = band(clamped);

  return (
    <figure className="flex items-center gap-5">
      <svg
        viewBox="0 0 128 128"
        className="size-32 shrink-0 -rotate-90"
        role="img"
        aria-label={`Career score ${clamped} out of 100`}
      >
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          strokeWidth="9"
          className="stroke-hairline"
        />
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          className="stroke-signal"
        />
      </svg>
      <figcaption>
        <p className="font-mono text-5xl font-semibold leading-none">{clamped}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Career score
        </p>
        <p className={`mt-2 text-sm font-medium ${tone}`}>{label}</p>
      </figcaption>
    </figure>
  );
}

export function SubScoreBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{clamped}</span>
      </div>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-hairline"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-data" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}