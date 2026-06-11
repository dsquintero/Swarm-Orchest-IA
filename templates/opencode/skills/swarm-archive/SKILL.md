---
name: swarm-archive
description: Archive process — merge delta specs into main specs and move change to archive/
license: MIT
---

# Archive Process

Archiving completes a change by applying its deltas to the main specs and preserving the change folder for history.

## Steps

### 1. Validate Readiness

Before archiving, verify:
- All tasks in `tasks.md` are marked `[x]`
- Verification report has no critical issues
- User has explicitly approved the archive

### 2. Merge Deltas

For each `swarmspec/changes/{feature}/specs/{domain}/spec.md`:

1. Read the main spec at `swarmspec/specs/{domain}/spec.md`
2. Apply ADDED requirements → append to the main spec
3. Apply MODIFIED requirements → find and replace the matching requirement
4. Apply REMOVED requirements → delete the matching requirement
5. Write the updated main spec

### 3. Handle Missing Main Spec

If `swarmspec/specs/{domain}/spec.md` does not exist:
- Create it with the content from the delta
- All ADDED requirements become the initial spec
- MODIFIED and REMOVED should not appear in a first spec

### 4. Move to Archive

```bash
# Rename change folder with date prefix
mv swarmspec/changes/{feature}/ swarmspec/changes/archive/YYYY-MM-DD-{feature}/
```

### 5. Clean Up

- Remove `.status.yaml` (or set it to `phase: done`)
- The archived folder preserves: proposal.md, specs/, design.md, tasks.md
- The exploration.md can be kept for audit or deleted

## Example

**Before archive:**
```
swarmspec/
├── specs/
│   └── usuarios/spec.md     → has 2 requirements
└── changes/
    └── crud-usuarios/
        └── specs/usuarios/spec.md → has 1 ADDED, 1 MODIFIED
```

**After archive:**
```
swarmspec/
├── specs/
│   └── usuarios/spec.md     → has 3 requirements (2 original + 1 ADDED)
└── changes/
    └── archive/
        └── 2026-05-05-crud-usuarios/
            ├── proposal.md
            ├── specs/usuarios/spec.md
            ├── design.md
            └── tasks.md
```

## Conflict Handling

If two active changes modify the same requirement, archive them in chronological order. The second archive will be aware of the first one's changes because it reads the updated main spec.
