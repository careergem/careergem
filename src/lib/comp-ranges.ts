/**
 * Hard-coded Canadian total-compensation bands (CAD, base salary) used to give
 * each target role a market anchor. These are editorial reference figures, not
 * live market data, and are shown with that caveat in the UI.
 */
type Band = { low: number; high: number };

const RANGES: Array<{ match: RegExp; band: Band }> = [
  { match: /staff|principal/i, band: { low: 175000, high: 240000 } },
  { match: /senior|sr\.?\s/i, band: { low: 130000, high: 175000 } },
  { match: /machine learning|ml engineer|mlops/i, band: { low: 110000, high: 165000 } },
  { match: /data engineer/i, band: { low: 95000, high: 145000 } },
  { match: /data scien|analytics engineer/i, band: { low: 90000, high: 140000 } },
  { match: /devops|platform|sre|site reliability|cloud engineer/i, band: { low: 100000, high: 150000 } },
  { match: /security/i, band: { low: 100000, high: 150000 } },
  { match: /backend|back-end|back end/i, band: { low: 85000, high: 135000 } },
  { match: /full[-\s]?stack/i, band: { low: 85000, high: 130000 } },
  { match: /frontend|front-end|front end/i, band: { low: 80000, high: 125000 } },
  { match: /mobile|ios|android/i, band: { low: 85000, high: 130000 } },
  { match: /qa|test engineer|automation/i, band: { low: 70000, high: 110000 } },
  { match: /electrical|hardware|firmware|embedded/i, band: { low: 80000, high: 125000 } },
  { match: /mechanical/i, band: { low: 72000, high: 110000 } },
  { match: /civil|structural/i, band: { low: 70000, high: 108000 } },
  { match: /biotech|bioinformatic|life science/i, band: { low: 68000, high: 105000 } },
  { match: /analyst/i, band: { low: 70000, high: 105000 } },
  { match: /intern|new grad|junior|entry/i, band: { low: 60000, high: 85000 } },
  { match: /engineer|developer/i, band: { low: 80000, high: 125000 } },
];

const FALLBACK: Band = { low: 75000, high: 115000 };

const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

export function compRangeFor(role: string): { low: number; high: number; label: string } {
  const hit = RANGES.find((entry) => entry.match.test(role));
  const band = hit?.band ?? FALLBACK;
  return { ...band, label: `${cad.format(band.low)} – ${cad.format(band.high)}` };
}
