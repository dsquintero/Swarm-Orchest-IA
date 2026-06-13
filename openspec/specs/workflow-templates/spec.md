# workflow-templates Specification

## Purpose
TBD - created by archiving change pulir-workflow-canonico. Update Purpose after archive.
## Requirements
### Requirement: Stack-agnostic templates
The canonical agent and skill templates SHALL NOT hardcode stack-specific examples (frameworks,
libraries, or language-specific class/method names). They SHALL use stack-neutral examples and defer to
the target project's `AGENTS.md` conventions for naming, patterns, and tooling.

#### Scenario: No framework names in agent templates
- **WHEN** a maintainer reviews `soia-explorer`, `soia-specifier`, `soia-designer` and the `soia-format` skill
- **THEN** no example references a specific framework or library (e.g. ASP.NET, MediatR, EF, FluentValidation)
- **AND** every example block is either language-neutral or explicitly tells the agent to follow `AGENTS.md`

#### Scenario: Conventions deferred to AGENTS.md
- **WHEN** an agent needs naming, folder, or pattern conventions
- **THEN** the template instructs it to read and follow the project's `AGENTS.md` rather than assuming a stack

### Requirement: Skills are the single source of format, delta, and archive rules
The format, delta, and archive rules SHALL live only in their skills (`soia-format`, `soia-delta`, `soia-archive`); agents and commands SHALL reference the relevant skill instead of duplicating those rules inline.

#### Scenario: Archive rules live only in the skill
- **WHEN** a maintainer searches for the ADDED/MODIFIED/REMOVED merge rules
- **THEN** the normative description exists only in the `soia-archive` (and `soia-delta`) skill
- **AND** `soia-orchestrator` and the `soia-archive` command reference the skill instead of restating the rules

#### Scenario: Format rules live only in the skill
- **WHEN** the `soia-specifier` agent needs the GIVEN/WHEN/THEN and SHALL/MUST rules
- **THEN** the agent loads the `soia-format` skill rather than embedding the rules in its own prompt

### Requirement: No Engram references
The canonical agent templates SHALL NOT reference Engram in any form, because Engram is out of scope ([ADR 0008](../../../docs/decisions/0008-engram-fuera-de-alcance.md)) and `soia init` does not detect it. No optional mention is allowed.

#### Scenario: Agents have zero Engram references
- **WHEN** a maintainer reviews the six `soia-*` agent templates
- **THEN** none contains any mention of Engram or a persistent-memory tool

### Requirement: Model injection marker preserved
Each canonical agent template SHALL retain the model injection marker in its frontmatter so that
`injector.ts` can inject `model`/`temperature` during `init`/`update`. Polishing the templates MUST NOT
remove or alter the marker.

#### Scenario: Every agent keeps the marker
- **WHEN** the template polish is complete
- **THEN** every `soia-*` agent template still contains the model injection marker comment
- **AND** `tests/templates.test.ts` passes

