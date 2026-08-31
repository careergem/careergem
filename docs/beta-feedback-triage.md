# Beta Feedback Triage

CareerGem's in-app feedback is optional and readable by the service operator so
it can guide product decisions. The form explicitly asks people not to paste
résumé, assessment, or personal information.

## Daily review (10 minutes)

1. In Supabase Table Editor, open `beta_feedback`.
2. Read new entries without copying them into public tools or social posts.
3. Classify each row:
   - **Bug:** a user could not finish a flow or got an incorrect state.
   - **Confusing:** the product worked but the user did not understand it.
   - **Value signal:** a useful moment worth preserving or explaining better.
   - **Feature request:** a suggested capability.
4. If a user included personal information despite the prompt, restrict who sees
   it and delete it when it is no longer needed for the support/triage purpose.

## Weekly review (30 minutes)

Create one small decision log with:

| Question                   | Evidence                                   | Decision                                             |
| -------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| What blocked assessments?  | Count and examples of bug/issue feedback   | Fix the highest-impact blocker.                      |
| What was most valuable?    | Repeated “useful” themes                   | Feature it in landing-page copy and videos.          |
| What was confusing?        | Repeated unclear terms/screens             | Rewrite, simplify, or add a hint.                    |
| What are users asking for? | Feature-request frequency and user context | Add only if it supports the core assessment outcome. |

Avoid treating one passionate request as a roadmap commitment. Look for a
repeated problem or a clearly severe failure.

## Privacy and access rules

- `beta_feedback` has no user-readable select policy; an authenticated person
  can submit only for their own account, while the service role can review rows.
- Do not place feedback exports in Git, a public spreadsheet, or a social-media
  content workspace.
- Do not reply publicly with information from a feedback entry.
- Add the table to the private free-tier export routine before future database
  migrations.

## Beta success signals

The feedback form itself is not the goal. In combination with product metrics,
look for:

- candidates complete their first assessment;
- candidates can state the first next action in their own words;
- candidates voluntarily use the safe-share feature;
- repeated feedback changes a concrete product or content decision.
