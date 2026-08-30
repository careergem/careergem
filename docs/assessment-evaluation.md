# Assessment Evaluation Protocol

CareerGem is a decision-support product, not an automated hiring system. This protocol evaluates whether
the career assessment is useful, consistent, specific, and appropriately calibrated for early-career STEM
candidates.

## Safe evaluation data

Only use one of the following:

- Synthetic profiles written for CareerGem.
- Candidate résumés collected with documented, revocable consent for this purpose.
- Fully de-identified examples whose licence explicitly permits the intended internal commercial evaluation.

Do not commit raw résumés, scrape résumé sites, upload bulk public résumés to an AI provider, or use
personally identifiable information in prompts, fixtures, screenshots, analytics, or issue reports.

For every non-synthetic example, keep a private provenance record outside the repository with the source,
licence or consent, date checked, permitted use, retention period, and removal contact/process.

## Launch evaluation set

Start with 24 synthetic profiles: six each for software engineering, data/AI, cybersecurity, and physical
engineering. Within each discipline, cover a student, new graduate, project-heavy candidate, and candidate
with related work experience. Pair each profile with one representative junior job description.

## Scorecard

For each run, record:

| Dimension   | Pass condition                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| Grounding   | Every stated strength, gap, and score rationale is supported by the supplied résumé or job description.         |
| Role fit    | The target role and seniority match the selected profile; no senior-role bar is applied to a student.           |
| Gap quality | Gaps are specific, differentiated, and actionable; real but undersold experience is marked as a confidence gap. |
| Roadmap     | All actions are concrete, achievable within 90 days, and ordered by impact.                                     |
| Calibration | Repeated assessment of identical input stays within five overall score points and one readiness point.          |
| Safety      | No invented credentials, discriminatory assumptions, or personally identifying content appears in the result.   |

## Release gate

Run the full set before launch and after any prompt, model, schema, or scoring change. Do not release a
scoring change unless every profile passes grounding and safety, and at least 85% pass the remaining
dimensions. Review failures manually, update the prompt or schema, then re-run the entire set.
