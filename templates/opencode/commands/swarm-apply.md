---
description: Continue the current SDD change from its current phase — delegates to the appropriate sub-agent
agent: swarm-orchestrator
---

Continue the current SDD change.

1. Read `.swarm/current.yaml` to find the active change.
   - If `.swarm/current.yaml` doesn't exist or is empty (`active_change: null`), ask the user which change to resume or suggest running `/swarm-propose` for a new change.

2. Verify the change directory exists at `swarmspec/changes/{feature}/`. If it doesn't, the reference is stale — clean up `.swarm/current.yaml` and ask the user.

3. Read `swarmspec/changes/{feature}/.status.yaml` for the current phase and artifact status.

4. Based on the phase, delegate to the appropriate sub-agent:

   | Phase | Action |
   |-------|--------|
   | `exploring` | Check if `exploration.md` exists. If yes, show to user and ask to continue. If no, re-delegate to `@swarm-explorer`. |
   | `spec-writing` | Check for `blockers.md`. If exists, show blocker to user. Otherwise, delegate to `@swarm-specifier`. |
   | `design` | Check for `blockers.md`. If exists, show blocker to user. Otherwise, delegate to `@swarm-designer`. |
   | `implementing` | Check for `blockers.md`. If exists, show blocker to user. Otherwise, delegate to `@swarm-implementer`. |
   | `verifying` | Delegate to `@swarm-verifier`. |
   | `archiving` | Execute archive process directly (merge deltas + move to archive). |

5. After the sub-agent completes:
   - Verify the expected artifact exists and is non-empty.
   - Show the results to the user.
   - Ask: "Proceed to {next phase}?"

6. If the user approves, update `.status.yaml` to the next phase and delegate.

7. If the user requests changes, re-delegate with the revision instructions appended (see revision protocol in `swarm-orchestrator.md`).