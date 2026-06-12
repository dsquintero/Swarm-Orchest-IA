---
description: Start a new SDD change — propose a feature and begin the exploration phase
agent: soia-orchestrator
---

Start a new SDD change for: $ARGUMENTS

1. Convert the description to a kebab-case name (lowercase, hyphens, no special chars). Example: "CRUD de Usuarios" → "crud-usuarios".

2. Check if a change with this name already exists in `soia-spec/changes/` (excluding `archive/`). If it does, ask the user whether to resume the existing change or create a new one with a different name.

3. Create the directory structure:
   ```
   soia-spec/changes/{name}/
   soia-spec/changes/{name}/specs/
   ```

4. Write `soia-spec/changes/{name}/.status.yaml`:
   ```yaml
   change: {name}
   phase: exploring
   created_at: {current-date}
   artifacts:
     exploration: pending
     proposal: pending
     specs: pending
     design: pending
     tasks: pending
   ```

5. Update `.soia/current.yaml`:
   ```yaml
   active_change: {name}
   ```

6. Delegate to `@soia-explorer` with the feature description.

7. After exploration completes, show the findings summary to the user and ask: "Should I continue to spec-writing, or do you want to revise the exploration?"

8. If continuing, update `.status.yaml` to `phase: spec-writing` and delegate to `@soia-specifier`.

9. If the user requests changes to the exploration, re-delegate `@soia-explorer` with the revision instructions.