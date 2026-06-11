---
name: swarm-delta
description: Delta specs — ADDED, MODIFIED, and REMOVED requirements with archive behavior
license: MIT
---

# Delta Specs

Delta specs describe **what changes** relative to the current source of truth. They live in `swarmspec/changes/{feature}/specs/{domain}/spec.md` and are applied to `swarmspec/specs/{domain}/spec.md` on archive.

## Sections

### ADDED Requirements

New behavior being introduced. On archive, these are **appended** to the main spec.

```markdown
## ADDED Requirements

### Requirement: New Feature Name
The system SHALL [describe behavior].

#### Scenario: Happy path
- GIVEN [state]
- WHEN [action]
- THEN [result]
```

### MODIFIED Requirements

Changed behavior. On archive, this **replaces** the existing requirement in the main spec. Always include the full updated requirement text.

```markdown
## MODIFIED Requirements

### Requirement: Updated Feature Name
The system SHALL [describe new behavior].
(Previously: [brief description of old behavior])

#### Scenario: Updated scenario
- GIVEN [state]
- WHEN [action]
- THEN [result]
```

### REMOVED Requirements

Deprecated behavior. On archive, this **deletes** the requirement from the main spec. Always explain why.

```markdown
## REMOVED Requirements

### Requirement: Old Feature Name
(Deprecated in favor of [replacement]. [Brief reason for removal])
```

## Archive Behavior (What Happens on Merge)

```
ADDED    → appended to end of main spec
MODIFIED → replaces matching requirement in main spec (matched by title)
REMOVED  → deleted from main spec
```

## Before Writing Deltas

1. Check if `swarmspec/specs/{domain}/spec.md` exists.
2. If it exists, read it to determine what's already specified.
3. If it doesn't exist, the entire spec is new → use ADDED for everything.
4. Never duplicate existing requirements — only specify what changes.
