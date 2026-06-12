---
description: Verify the current change — validate implementation against specs
agent: soia-orchestrator
---

Verify the current SDD change.

1. Read `.soia/current.yaml` to find the active change.
   - If no active change, ask the user which change to verify.

2. Read `soia-spec/changes/{feature}/.status.yaml`.
   - If the phase is not at least `implementing`, warn the user: "The change is still at phase **{phase}**. Verification is typically done after implementation. Continue anyway?"

3. Set phase to `verifying` in `.status.yaml`.

4. Delegate to `@soia-verifier` with:
   ```
   Verify the implementation of "{feature}" against its specifications.
   Read soia-spec/changes/{feature}/specs/ for delta requirements and scenarios.
   Read soia-spec/changes/{feature}/design.md for expected file changes.
   Read soia-spec/changes/{feature}/tasks.md to check all tasks are complete.
   Inspect the actual code files listed in design.md.
   Run any available tests for the affected areas.
   Write the verification report to soia-spec/changes/{feature}/verification.md.
   ```

5. After verification, read `verification.md` and show the summary to the user.

6. Based on the status:

   | Status | Action |
   |--------|--------|
   | PASS | Ask: "All checks passed. Proceed to archiving?" |
   | PASS WITH WARNINGS | Show warnings. Ask: "Minor issues found. Fix warnings (back to implementing) or proceed to archiving?" |
   | FAIL | Show critical issues. Ask: "Critical issues found. Send back to implementing with fixes, or proceed anyway at your own risk?" |

7. If fixing: update phase to `implementing` and re-delegate `@soia-implementer` with the specific issues to fix.

8. If proceeding: update phase to `archiving` and execute the archive process.