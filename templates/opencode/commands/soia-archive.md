---
description: Archive the current change — merge delta specs into main specs and move to archive/
agent: soia-orchestrator
---

Archive the current SDD change.

1. Read `.soia/current.yaml` to find the active change.
   - If no active change, ask the user which change to archive.

2. **Pre-archive validation**:

   a. Read `soia-spec/changes/{feature}/tasks.md` — verify all tasks are `[x]`. If any are `[ ]` or `[?]`, warn the user: "Not all tasks are complete."

   b. Read `soia-spec/changes/{feature}/verification.md` — check the status. If `FAIL`, warn: "Verification failed with {count} critical issues. Are you sure you want to archive?"

   c. Check for `soia-spec/changes/{feature}/blockers.md` — if it exists, warn: "There are unresolved blockers."

   d. Check for other active changes in `soia-spec/changes/` (not in `archive/`) that might touch the same domains. If so, warn: "Active change **{other}** also modifies **{domain}**. Archive it first to avoid merge conflicts."

3. Ask the user for explicit confirmation: "Archive change **{feature}**? This will merge deltas into main specs and move the change to archive."

4. If confirmed, set phase to `archiving` in `.status.yaml`.

5. Load the `soia-archive` skill and merge each delta spec **exactly as the skill describes** (ADDED/MODIFIED/REMOVED per domain; if the main spec does not exist, create it from the delta).

6. Move the change folder:
   ```
   soia-spec/changes/{feature}/ → soia-spec/changes/archive/{YYYY-MM-DD}-{feature}/
   ```

7. Update `.status.yaml` in the archived folder: `phase: done`.

8. Update `.soia/current.yaml`: `active_change: null`.

9. Confirm to the user: "Change **{feature}** archived. Specs updated in `soia-spec/specs/`. Change preserved in `soia-spec/changes/archive/{date}-{feature}/`."