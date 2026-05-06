# {{PROJECT_NAME}}

## Stack

- **Runtime**: {{STACK_RUNTIME}}
- **Framework**: {{STACK_FRAMEWORK}}
- **Language**: {{STACK_LANGUAGE}}

## Project Structure

```
{{PROJECT_STRUCTURE}}
```

## Conventions

- **Naming**: {{NAMING_CONVENTION}}
- **Architecture**: {{ARCHITECTURE_PATTERN}}
- **Validation**: {{VALIDATION_LIBRARY}}
- **ORM**: {{ORM}}
- **Testing**: {{TEST_FRAMEWORK}}

## Rules

- Follow existing patterns and conventions found in this project.
- Do NOT introduce new libraries or patterns unless explicitly justified.
- All code must be covered by tests where a test framework exists.
- Use the same error handling patterns already established in the codebase.
- API responses follow the existing format (check existing controllers).
- Database changes require a migration — do NOT modify schemas directly.

## SDD Workflow

This project uses Swarm-Orchest-IA for Spec-Driven Development.

### Key Paths

- **Specs**: `swarmspec/specs/` — source of truth for system behavior
- **Changes**: `swarmspec/changes/` — active feature work
- **Archive**: `swarmspec/changes/archive/` — completed changes
- **Current**: `.swarm/current.yaml` — active change tracker

### Available Commands

- `/swarm-propose <description>` — Start a new SDD change
- `/swarm-apply` — Continue the current change from its current phase
- `/swarm-verify` — Verify current implementation against specs
- `/swarm-archive` — Archive the current change (merge deltas into specs)

### Format Rules

- Specs use OpenSpec format: GIVEN/WHEN/THEN scenarios, SHALL/MUST/SHOULD keywords
- Delta specs use ADDED/MODIFIED/REMOVED sections
- See skills `swarm-format` and `swarm-delta` for detailed format rules