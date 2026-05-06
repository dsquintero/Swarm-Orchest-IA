---
description: Archive the current change — merge delta specs into main specs and move to archive/
agent: swarm-orchestrator
---

Archive the current SDD change.

1. Read `.swarm/current.yaml` to find the active change.
   - If no active change, ask the user which change to archive.

2. **Pre-archive validation**:

   a. Read `swarmspec/changes/{feature}/tasks.md` — verify all tasks are `[x]`. If any are `[ ]` or `[?]`, warn the user: "Not all tasks are complete."

   b. Read `swarmspec/changes/{feature}/verification.md` — check the status. If `FAIL`, warn: "Verification failed with {count} critical issues. Are you sure you want to archive?"

   c. Check for `swarmspec/changes/{feature}/blockers.md` — if it exists, warn: "There are unresolved blockers."

   d. Check for other active changes in `swarmspec/changes/` (not in `archive/`) that might touch the same domains. If so, warn: "Active change **{other}** also modifies **{domain}**. Archive it first to avoid merge conflicts."

3. Ask the user for explicit confirmation: "Archive change **{feature}**? This will merge deltas into main specs and move the change to archive."

4. If confirmed, set phase to `archiving` in `.status.yaml`.

5. Load skill `swarm-archive` for the merge process.

6. Merge delta specs:
   For each `swarmspec/changes/{feature}/specs/{domain}/spec.md`:

   a. Read the delta spec.
   b. Check if `swarmspec/specs/{domain}/spec.md` exists:
      - **Exists**: Apply ADDED (append), MODIFIED (replace by title), REMOVED (delete by title).
      - **Does not exist**: Create it. All content becomes the initial spec (strip ADDED/MODIFIED/REMOVED headers, keep requirements).
   c. Write the updated main spec.

7. Move the change folder:
   ```
   swarmspec/changes/{feature}/ → swarmspec/changes/archive/{YYYY-MM-DD}-{feature}/
   ```

8. Update `.status.yaml` in the archived folder: `phase: done`.

9. Update `.swarm/current.yaml`: `active_change: null`.

10. If Engram is available, save a summary of the completed change.

11. Confirm to the user: "Change **{feature}** archived. Specs updated in `swarmspec/specs/`. Change preserved in `swarmspec/changes/archive/{date}-{feature}/`."