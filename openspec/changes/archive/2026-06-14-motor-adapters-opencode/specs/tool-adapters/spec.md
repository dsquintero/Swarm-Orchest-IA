## ADDED Requirements

### Requirement: Tool-agnostic canonical source
The canonical templates SHALL be tool-agnostic: each `.md` uses neutral frontmatter (e.g. `role`, `capabilities`, `delegatesTo`) and a body whose tool-specific points are expressed as injection tags, never as one tool's native syntax. The canonical source lives under `templates/canonical/`.

#### Scenario: Canonical agent has no tool-native frontmatter
- **WHEN** a maintainer inspects a `templates/canonical/agents/*.md` file
- **THEN** its frontmatter contains neutral fields, not OpenCode-specific keys (`mode`, `permission`, `color`, `agent:`)
- **AND** tool-specific points in the body are injection tags (e.g. the model marker, `{{soia:delegate:…}}`, `{{soia:skill:…}}`)

### Requirement: Rendering through adapters without symlinks
`soia init` SHALL render the canonical source through a tool adapter that writes plain copies to the tool's native location. It SHALL NOT create symlinks.

#### Scenario: Init writes rendered files, no symlinks
- **WHEN** `soia init` runs for a supported tool
- **THEN** the agents/skills/commands are written as regular files rendered for that tool
- **AND** no symlink is created anywhere (works on Windows without Developer Mode)

### Requirement: Native paths by scope
The adapter SHALL resolve each artifact's output path from the tool's native layout and the selected scope: project-local writes under the project (e.g. `.opencode/...`), global writes under the tool's global config directory (e.g. `~/.config/opencode/...`).

#### Scenario: Local scope writes into the project
- **WHEN** `soia init` runs in local mode for OpenCode
- **THEN** agents/skills/commands are written under `<project>/.opencode/`

#### Scenario: Global scope writes into the tool's global dir
- **WHEN** `soia init` runs in global mode for OpenCode
- **THEN** agents/skills/commands are written under `~/.config/opencode/`
- **AND** nothing is copied to `~/.config/soia/templates/`

### Requirement: Model injection during render
The adapter SHALL inject each agent's configured model during render, reading the model configuration (`.agents-conf.yaml`, global merged with local). The injection point is the canonical model marker.

#### Scenario: Rendered agent carries its model
- **WHEN** the adapter renders an agent that has the model marker
- **THEN** the output agent has its configured model written in the tool's native frontmatter
- **AND** an agent template missing its model in config fails with a clear error

### Requirement: Extensible adapter registry
Adapters SHALL be resolved from a registry by tool id, so new tools are added by registering an adapter without changing `init`'s control flow.

#### Scenario: Init resolves the adapter by tool id
- **WHEN** `soia init` runs for tool id `opencode`
- **THEN** it resolves the registered OpenCode adapter from the registry and renders through it
- **AND** an unregistered tool id fails with a clear error
