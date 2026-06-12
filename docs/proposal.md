# Proposal: Swarm-Orchest-IA — Multi-Agent SDD Orchestrator

> ⚠️ **Documento histórico de visión.** Describe el diseño y la intención **originales** del proyecto y
> puede **divergir de la implementación actual** (p. ej. menciona `_prototype/`, Engram, `--tool cursor`
> y `.swarm.yaml`, que hoy no aplican). Para el **estado real** mirá la documentación en
> [docs/](README.md) (arquitectura, uso, decisiones/ADRs) y el [ROADMAP](../ROADMAP.md).

## Intent

Crear un **orquestador de agentes SDD (Spec-Driven Development)** liviano, portable y entendible, que permita a cualquier equipo estructurar el desarrollo de software con AI de forma predecible, trazable y colaborativa — con un CLI mínimo que referencia plantillas centralizadas en lugar de copiarlas, y Engram como memoria opcional.

## Problem Statement

### Contexto actual

Las herramientas de AI coding (Claude Code, OpenCode, Cursor, etc.) son poderosas pero **impredecibles** cuando los requerimientos viven solo en el historial del chat. No hay continuidad entre sesiones, no hay trazabilidad de decisiones, y cada desarrollador termina con su propio "estilo" de prompts.

Herramientas como **OpenSpec** resuelven la parte del SDD (specs, deltas, archive) pero asumen un flujo monolítico en una sola sesión de chat.

Herramientas como **gentle-ai** resuelven la orquestación multi-agente pero introducen:
- Un CLI en Go, un lenguaje que el equipo no domina
- Componentes como GGA cuyo propósito no es claro
- Una curva de aprendizaje que aleja a los equipos
- Dependencia de un mantenedor externo

### Lo que realmente necesitamos

Un **sistema de coordinación SDD** que:
- Sea **OpenCode nativo** — use los mecanismos que OpenCode ya provee (agentes, skills, comandos)
- **Referencie plantillas centralizadas** — las plantillas viven en `~/.config/swarm/templates/`, los proyectos las referencian, no las copian
- Sea **entendible** — cualquier dev lee la documentación de OpenCode y entiende el flujo
- Sea **compartible** — el equipo instala las plantillas una vez y las referencia desde cada proyecto
- **Engram opcional** — funciona con o sin memoria persistente

## Scope

### In scope

- **CLI `swarm`** mínimo en TypeScript/Node.js: `swarm init`, `swarm update`, `swarm fallback`, `swarm models`
- **`.agents-conf.yaml`** centralizado — un solo archivo para configurar modelos de todos los agentes, con primary/fallback
- **Templates centralizados** en `~/.config/swarm/templates/` con referencias desde el proyecto (sin modelos hardcodeados)
- **Agentes OpenCode** (`.opencode/agents/swarm-*.md`) para cada fase SDD — `model:` y `temperature:` inyectados por `swarm init`
- **Skills reutilizables** (`.opencode/skills/swarm-*/SKILL.md`)
- **Comandos personalizados** (`.opencode/commands/swarm-*.md`)
- `AGENTS.md` con reglas del proyecto
- `swarmspec/` para specs y cambios (formato OpenSpec: GIVEN/WHEN/THEN, deltas, archive)
- Stack .NET 8 como ejemplo inicial
- Soporte multi-tool: `--tool opencode` (ahora), `--tool claude`, `--tool cursor` (futuro)

### Out of scope

- Switchers de proveedores AI (GGA, etc.)
- TUIs, dashboards complejos
- Plugins de IDE
- Automatización CI/CD del flujo SDD (futuro)
- Engram obligatorio — siempre será opcional

## Approach

### Filosofía

```
referencias > copias
un solo origen de plantillas > redundancia en cada proyecto
usar lo que OpenCode ya tiene > inventar convenciones propias
agentes nativos > CLIs orquestadores
Engram opcional > dependencia forzada
```

### Arquitectura del CLI `swarm`

```
~/.config/swarm/
├── .agents-conf.yaml                     ← UNICO archivo de configuración de modelos
└── templates/                            ← único origen central (agentes SIN model: hardcodeado)
    ├── opencode/                         ← plantillas para OpenCode
    │   ├── agents/
    │   │   ├── swarm-orchestrator.md     ← model: se inyecta en swarm init
    │   │   ├── swarm-explorer.md
    │   │   ├── swarm-specifier.md
    │   │   ├── swarm-designer.md
    │   │   ├── swarm-implementer.md
    │   │   └── swarm-verifier.md
    │   ├── skills/
    │   │   ├── swarm-format/SKILL.md
    │   │   ├── swarm-delta/SKILL.md
    │   │   └── swarm-archive/SKILL.md
    │   └── commands/
    │       ├── swarm-propose.md
    │       ├── swarm-apply.md
    │       ├── swarm-verify.md
    │       └── swarm-archive.md
    ├── claude/                           ← futuro
    └── cursor/                           ← futuro
```

### Proyecto inicializado con `swarm init`

```
mi-proyecto/
│
├── .swarm.yaml                    ← "mis plantillas están en ~/.config/swarm/templates/opencode"
├── .opencode/                     ← symlinks/referencias a las plantillas centrales
│   ├── agents/                    → ~/.config/swarm/templates/opencode/agents/
│   ├── skills/                    → ~/.config/swarm/templates/opencode/skills/
│   └── commands/                  → ~/.config/swarm/templates/opencode/commands/
│
├── AGENTS.md                      ← se genera con el nombre del proyecto (único por proyecto)
├── opencode.json                  ← configuración OpenCode del proyecto
│
├── swarmspec/                     ← fuente de verdad del proyecto (se crea, no se referencia)
│   ├── specs/
│   │   └── <dominio>/
│   │       └── spec.md
│   └── changes/
│       ├── <feature-name>/
│       │   ├── .status.yaml
│       │   ├── proposal.md
│       │   ├── specs/ (deltas)
│       │   │   └── <dominio>/
│       │   │       └── spec.md
│       │   ├── design.md
│       │   └── tasks.md
│       └── archive/
│
├── .swarm/                        ← metadatos locales
│   ├── config.yaml                 ← tool seleccionado, fecha init, ruta templates
│   └── .agents-conf.yaml          ← override local (solo claves que cambian, hereda del global)
│
└── .engram/                       ← solo si el usuario elige usar Engram
```

### `swarm init` paso a paso

```bash
swarm init --tool opencode
```

| Paso | Acción |
|---|---|
| 1 | Lee `~/.config/swarm/.agents-conf.yaml` para obtener modelos de cada agente |
| 2 | Crea `.swarm.yaml` con ruta a las plantillas |
| 3 | Crea `.opencode/agents/`, `skills/`, `commands/` como symlinks a `~/.config/swarm/templates/opencode/` inyectando `model:` y `temperature:` desde `.agents-conf.yaml` en cada agente |
| 4 | Si no existe `.swarm/.agents-conf.yaml` local, lo copia del global para permitir override |
| 5 | Genera `AGENTS.md` con el nombre del proyecto y descripción del stack |
| 6 | Genera `opencode.json` con la configuración de OpenCode |
| 7 | Crea `swarmspec/specs/` + `changes/archive/` con un spec de ejemplo |
| 8 | Pregunta: "Usar Engram? [S]/n" — si S, valida que Engram esté instalado y ejecuta `engram init` |
| 9 | Crea `.swarm/` con metadatos locales |

### Multi-tool: ahora y futuro

```bash
swarm init --tool opencode          # configura OpenCode (hoy)
swarm init --tool claude            # configura Claude Code (futuro)
swarm init --tool cursor            # configura Cursor (futuro)
```

El CLI conoce los paths de cada herramienta y genera la estructura correcta. La carpeta `~/.config/swarm/templates/` contiene una subcarpeta por tool.

### Windows

En sistemas Windows:
- **Developer mode ON** → symlinks nativos (Windows 10+)
- **Developer mode OFF** → fallback a copias con detección de cambios

### `swarm update`

Sincroniza las referencias cuando se actualizan las plantillas centrales **o el `.agents-conf.yaml`**:

```bash
swarm update                        # actualiza symlinks (o copias) en el proyecto actual
swarm update --all                  # busca todos los proyectos con .swarm.yaml y actualiza
```

### `swarm fallback` — modelos de respaldo

Cuando un modelo principal no responde o querés bajar costos temporalmente:

```bash
swarm fallback swarm-orchestrator     # cambia ese agente a su fallback
swarm fallback --all                  # cambia todos los agentes a fallback
swarm fallback --restore              # vuelve a modelos primary
```

### `swarm models` — estado actual

```bash
swarm models                          # muestra configuración actual de modelos por agente
swarm models --primary                # solo modelos primary
swarm models --fallback               # solo modelos fallback activos
```

### Comandos adicionales (futuro opcional)

```bash
swarm list                          # lista cambios activos (lee swarmspec/changes/)
swarm status                        # muestra fase del cambio activo
```

## `.agents-conf.yaml` — configuración centralizada de modelos

**Fuente de verdad única** para todos los modelos de los agentes. El `swarm init` inyecta `model:` y `temperature:` en cada agente desde este archivo. Las plantillas NO contienen modelo hardcodeado.

### Archivo global

```yaml
# ~/.config/swarm/.agents-conf.yaml
# Proveedor por defecto: opencode-go (OpenCode Go subscription)

swarm-orchestrator:
  primary: opencode-go/deepseek-v4-pro
  fallback: opencode-go/kimi-k2.6
  temperature: 0.3

swarm-explorer:
  primary: opencode-go/deepseek-v4-flash
  fallback: opencode-go/minimax-m2.7
  temperature: 0.1

swarm-specifier:
  primary: opencode-go/glm-5
  fallback: opencode-go/deepseek-v4-pro
  temperature: 0.2

swarm-designer:
  primary: opencode-go/glm-5.1
  fallback: opencode-go/glm-5
  temperature: 0.3

swarm-implementer:
  primary: opencode-go/deepseek-v4-pro
  fallback: opencode-go/kimi-k2.6
  temperature: 0.2

swarm-verifier:
  primary: opencode-go/glm-5
  fallback: opencode-go/deepseek-v4-pro
  temperature: 0.1
```

### Override por proyecto (opcional)

```yaml
# mi-proyecto/.swarm/.agents-conf.yaml (solo lo que sobreescribe)

swarm-implementer:
  primary: opencode-go/kimi-k2.6
```

Si existe `.swarm/.agents-conf.yaml`, pisa las claves definidas y hereda el resto del global.

### Asignación por costo

| Agente | Modelo primario | req/mes | Perfil |
|---|---|---|---|
| explorer | DeepSeek V4 **Flash** | 31,650 | Barato — solo lectura, no escribe |
| orchestrator | DeepSeek V4 **Pro** | 3,450 | Medio — coordina, decide fases |
| implementer | DeepSeek V4 **Pro** | 3,450 | Medio — escribe código |
| specifier | **GLM-5** | 1,150 | Caro — specs formales, precisión alta |
| designer | **GLM-5.1** | 880 | Más caro — decisiones complejas de arquitectura |
| verifier | **GLM-5** | 1,150 | Caro — validación exhaustiva |

Los modelos caros (GLM) solo se usan en 3 de las 6 fases, y cada una se ejecuta pocas veces por feature.

## Plantillas de agentes (sin modelo hardcodeado)

Los archivos en `~/.config/swarm/templates/opencode/agents/` **no contienen `model:` ni `temperature:`**. El `swarm init` los inyecta desde `.agents-conf.yaml`.

### Desviaciones respecto al proposal original

Las plantillas refinadas tienen 3 desviaciones intencionales respecto a los frontmatter del proposal original:

1. **swarm-explorer**: `write: true` (en lugar de `write: false`). El explorer necesita escribir `exploration.md`. Se mantiene `edit: false` para que no modifique código existente.

2. **swarm-verifier**: `write: true` (en lugar de `write: false`). El verifier necesita escribir `verification.md`. Se mantiene `edit: false` para que no modifique código.

3. **swarm-orchestrator**: permisos expandidos. Ademas de `task: "swarm-*": allow`, se agregaron `write: swarmspec/**`, `edit: swarmspec/**`, `write: .swarm/**`, `edit: .swarm/**` y `bash: allow`. El orquestador necesita crear `.status.yaml`, `.swarm/current.yaml` y ejecutar el archivado.

### swarm-orchestrator.md

```markdown
---
description: Swarm SDD orchestrator that coordinates the full spec-driven workflow
mode: primary
# model y temperature se inyectan desde .agents-conf.yaml en swarm init
permission:
  task:
    "swarm-*": allow
  write:
    "swarmspec/**": allow
    ".swarm/**": allow
  edit:
    "swarmspec/**": allow
    ".swarm/**": allow
  bash: allow
---

You are the **Swarm Orchestrator** — central coordinator of the SDD lifecycle.

## Context Setup
1. Read `AGENTS.md` for project conventions, stack, and structure.
2. Read `swarmspec/changes/{feature}/.status.yaml` for current phase.

## Phases
| Phase | Sub-agent | Output |
|---|---|---|
| exploring | `@swarm-explorer` | `exploration.md` |
| spec-writing | `@swarm-specifier` | `proposal.md` + delta specs |
| design | `@swarm-designer` | `design.md` |
| implementing | `@swarm-implementer` | Code + updated `tasks.md` |
| verifying | `@swarm-verifier` | Verification report |
| archiving | self | Merged specs + archived change |

## Workflow Rules
1. Always confirm with user before advancing to the next phase.
2. Update `.status.yaml` after every phase transition.
3. Never skip phases: exploring → spec-writing → design → implementing → verifying → archiving.
```

### swarm-explorer.md

```markdown
---
description: Investigates codebase to understand current structure, find affected files, detect patterns and risks
mode: subagent
# model y temperature se inyectan desde .agents-conf.yaml
tools:
  write: true
  edit: false
  bash: true
---

You are the **Swarm Explorer**.

1. Read existing specs in `swarmspec/specs/` for current behavior.
2. Search the codebase for relevant entities, controllers, patterns.
3. Detect risks: migrations, breaking changes, dependencies.
4. Write `swarmspec/changes/{feature}/exploration.md`.
5. If Engram is available, save important discoveries.

Do NOT write code. Do NOT create specs. Only explore and report.
```

### swarm-specifier.md

```markdown
---
description: Writes proposal.md and delta specs in OpenSpec format (GIVEN/WHEN/THEN)
mode: subagent
# model y temperature se inyectan desde .agents-conf.yaml
tools:
  write: true
  edit: true
  bash: false
color: "#82b366"
---

You are the **Swarm Specifier**.

1. Read `exploration.md` for codebase context.
2. Load skill `swarm-format` for GIVEN/WHEN/THEN and SHALL/MUST rules.
3. Load skill `swarm-delta` for ADDED/MODIFIED/REMOVED rules.
4. Write `proposal.md` (intent, scope, approach).
5. Write `specs/{domain}/spec.md` delta spec.
6. Describe observable behavior, NOT implementation (no class names, no frameworks).
```

### swarm-designer.md

```markdown
---
description: Makes architecture decisions and writes technical design documents
mode: subagent
# model y temperature se inyectan desde .agents-conf.yaml
tools:
  write: true
  edit: true
  bash: false
color: "#d6b656"
---

You are the **Swarm Designer**.

1. Read `proposal.md` and delta specs for requirements.
2. Read `exploration.md` for codebase patterns.
3. Write `design.md` with: technical approach, architecture decisions (why + trade-offs), data flow, concrete file changes.
4. Follow existing codebase patterns — do not introduce new ones unless justified.
```

### swarm-implementer.md

```markdown
---
description: Implements code following specs, design, and tasks checklist
mode: subagent
# model y temperature se inyectan desde .agents-conf.yaml
tools:
  write: true
  edit: true
  bash: true
color: "#d79b00"
---

You are the **Swarm Implementer**.

1. If `tasks.md` doesn't exist, generate it by breaking down the design.
2. Read specs, design, and tasks.
3. Implement task by task, marking `[x]` on completion.
4. Follow existing codebase conventions.
5. If blocked, STOP and report — do not guess.
```

### swarm-verifier.md

```markdown
---
description: Validates implementation against specs across completeness, correctness, and coherence
mode: subagent
# model y temperature se inyectan desde .agents-conf.yaml
tools:
  write: true
  edit: false
  bash: true
---
description: Validates implementation against specs — completeness, correctness, coherence
mode: subagent
# model y temperature se inyectan desde .agents-conf.yaml
tools:
  write: false
  edit: false
  bash: true
color: "#b85450"
---

You are the **Swarm Verifier**.

Validate across three dimensions:
- **Completeness**: all tasks done, all requirements implemented, all scenarios covered.
- **Correctness**: code matches spec intent, edge cases handled, error states correct.
- **Coherence**: design decisions reflected, naming consistent, patterns followed.

Generate a report with critical issues, warnings, and recommendations.
Do NOT modify code — only report.
```

## El flujo SDD completo

### Fases

| Fase | Agente | Modelo primario | Fallback | Output |
|---|---|---|---|---|
| Exploración | `@swarm-explorer` | DeepSeek V4 Flash | MiniMax M2.7 | `exploration.md` + discoveries |
| Especificación | `@swarm-specifier` | GLM-5 | DeepSeek V4 Pro | `proposal.md` + deltas specs |
| Diseño | `@swarm-designer` | GLM-5.1 | GLM-5 | `design.md` + decisiones |
| Implementación | `@swarm-implementer` | DeepSeek V4 Pro | Kimi K2.6 | Código + tasks actualizados |
| Verificación | `@swarm-verifier` | GLM-5 | DeepSeek V4 Pro | Reporte de verificación |
| Archivado | Orquestador | DeepSeek V4 Pro | — | Merge + archive |

### Flujo de orquestación

```
Usuario: /swarm-propose "crud de usuarios"
    │
    ▼
ORQUESTADOR
    ├── Crea swarmspec/changes/crud-usuarios/
    ├── .status.yaml: phase: exploring
    └── Delega a @swarm-explorer
            │
            ▼
        exploration.md + discoveries
            │
            ▼
    ORQUESTADOR muestra al usuario
    │
    └── Usuario: "OK seguí"
        │
        ▼
    .status.yaml: phase: spec-writing
    → @swarm-specifier → proposal.md + deltas
    → USUARIO REVISA
    → .status.yaml: phase: design
    → @swarm-designer → design.md
    → USUARIO REVISA
    → .status.yaml: phase: implementing
    → @swarm-implementer → código + tasks
    → .status.yaml: phase: verifying
    → @swarm-verifier → reporte
    → USUARIO REVISA
    → .status.yaml: phase: archiving
    → ORQUESTADOR mergea deltas a swarmspec/specs/
    → Mueve a swarmspec/changes/archive/
    → ✅ FIN
```

## Comunicación entre agentes

Los agentes y sub-agentes **no se comunican directamente entre sí**. Toda comunicación fluye a través del orquestador usando dos mecanismos nativos de OpenCode:

### Task tool (delegación)

El orquestador usa la herramienta `task` de OpenCode para invocar un sub-agente. El sub-agente corre en su **propia sesión** con contexto limpio, recibe instrucciones, y devuelve un resultado:

```
ORQUESTADOR
  task({
    agent: "swarm-explorer",
    prompt: "Investigate codebase for crud-usuarios.
             Write findings to swarmspec/changes/crud-usuarios/exploration.md"
  })
       │
       ▼
  ┌──────────────────────────────┐
  │  SESIÓN DE @swarm-explorer   │
  │  - Lee código (solo lectura) │
  │  - Lee specs existentes       │
  │  - Escribe exploration.md     │
  │  - Retorna resumen            │
  └──────────┬───────────────────┘
             │
             ▼
  ORQUESTADOR recibe el resultado
  y lo muestra al usuario
```

El usuario puede navegar entre sesiones con `<Leader>+Right/Left` para ver qué hizo cada sub-agente.

### File-based (traspaso de estado)

Cada agente **escribe** archivos que el siguiente agente **lee**:

```
@swarm-explorer        @swarm-specifier        @swarm-implementer
     │                      │                       │
     │ escribe              │ lee                   │ lee
     ▼                      ▼                       ▼
exploration.md  ──────→  exploration.md        exploration.md
                         proposal.md ────────→  proposal.md
                         specs/delta.md ──────→  specs/delta.md
                                                   design.md (lee)
                                                   tasks.md (escribe ✓/✗)
```

### Restricciones

- **Los sub-agentes NO se comunican entre sí** — solo el orquestador invoca sub-agentes
- **Solo el orquestador** toca `.status.yaml` y `.swarm/current.yaml`
- Cada sub-agente tiene herramientas restringidas según su rol (ej: explorer no puede escribir código)

## Decisiones técnicas

| Decisión: `.agents-conf.yaml` como fuente única de modelos
Los modelos no van hardcodeados en las plantillas. Viven en `~/.config/swarm/.agents-conf.yaml` con primary/fallback por agente. `swarm init` los inyecta al crear el proyecto. Cambiar un modelo para todos los agentes es editar una línea.

### Decisión: Templates centralizados, no copias
Las plantillas viven en `~/.config/swarm/templates/`. Los proyectos las referencian via symlinks. Un cambio en las plantillas se refleja en todos los proyectos con `swarm update`.

### Decisión: CLI mínimo en TypeScript/Node.js
Un solo paquete npm con comandos claros (`init`, `update`, `fallback`, `models`). Sin TUI compleja, sin GGA, sin componentes extraños. Se eligió **TypeScript/Node.js** porque es la stack que el equipo domina; fácil de instalar con `npm`/`npx` y multiplataforma (Windows/Linux/macOS).

### Decisión: OpenCode nativo
OpenCode ya soporta multi-agentes con modelos distintos por fase. No necesitamos un CLI orquestador — usamos `permission.task`, `mode: subagent`, `model` por agente.

### Decisión: Formato OpenSpec
GIVEN/WHEN/THEN, SHALL/MUST, deltas ADDED/MODIFIED/REMOVED. El formato es probado, entendible y funciona con cualquier AI.

### Decisión: Engram opcional
Engram mejora la experiencia pero no es obligatorio. El proyecto funciona sin memoria persistente. En `swarm init` se pregunta al usuario, se detecta instalación y se procede según corresponda.

### Decisión: Prefijo `swarm-` y carpeta `swarmspec/`
Todo alineado con el nombre del proyecto. Los agentes son `swarm-*`, los comandos `/swarm-*`, los specs están en `swarmspec/`.

### Decisión: Stack .NET 8 para ejemplos
El equipo trabaja con .NET. Skills y ejemplos reflejan API REST, EF Core, CQRS con MediatR, FluentValidation, RabbitMQ.

## Cómo se comparte con el equipo

```bash
# 1. Cada dev instala las plantillas (una vez)
git clone https://github.com/tu-org/swarm-templates ~/.config/swarm/templates

# 2. Configurar modelos (una vez)
# Editar ~/.config/swarm/.agents-conf.yaml con modelos preferidos
# o usar el default con opencode-go

# 3. Instalar el CLI (TypeScript/Node.js)
git clone https://github.com/tu-user/swarm-orchest-ia
cd swarm-orchest-ia && npm install && npm run build
# luego usar: node dist/cmd/swarm.js <comando>  (o npm link para exponer `swarm`)

# 4. En cada proyecto
swarm init --tool opencode
# Responde S/n a Engram según prefieras

# 5. Abrir OpenCode y empezar
/swarm-propose "mi feature"
```

Cuando actualices una plantilla de agente, todos los proyectos se actualizan con:

```bash
cd ~/.config/swarm/templates && git pull
swarm update --all
```

Sin redundancias. Sin copias desincronizadas. Un cambio, todos los proyectos actualizados.

## Defaults y templates de referencia

El directorio `_prototype/defaults/` contiene los archivos que `swarm init` usa como referencia para crear la estructura del proyecto:

```
_prototype/defaults/
├── .agents-conf.yaml                  ← Config global de modelos (copia a ~/.config/swarm/)
├── AGENTS.md                          ← Template con {{PLACEHOLDERS}} (genera por proyecto)
├── opencode.json                      ← Config OpenCode mínima (solo nombre y descripción)
├── swarm.yaml                         ← Template de .swarm.yaml (apunta a templates centralizados)
├── swarm-config.yaml                  ← Template de .swarm/config.yaml (metadatos locales)
├── current.yaml                       ← Template de .swarm/current.yaml (tracker de change activo)
├── local-agents-conf.yaml             ← Template de .swarm/.agents-conf.yaml (override local)
└── swarmspec-example/
    └── specs/hello-mundo/spec.md      ← Spec de ejemplo del formato OpenSpec
```

### Nota sobre opencode.json

El `opencode.json` del proyecto **NO contiene configuración de agentes**. Los modelos se inyectan directamente en el frontmatter de cada agente durante `swarm init`. Los agentes se descubren automáticamente por OpenCode en `.opencode/agents/`.

1. ✅ Definir el proposal (este documento)
2. ✅ Crear templates base en `_prototype/templates/opencode/` (13 archivos)
3. ✅ Quitar `model:` y `temperature:` hardcodeados de las plantillas de agentes
4. ✅ Refinar agentes con detalle fino: delegation prompts, transition criteria, blocking protocol, error handling, verification criteria, search strategy, ADR format
5. ✅ Crear defaults en `_prototype/defaults/`: `.agents-conf.yaml`, `AGENTS.md`, `opencode.json`, `swarm.yaml`, `current.yaml`, spec de ejemplo
6. ✅ Implementar CLI `swarm init --tool opencode` en TypeScript/Node.js (lee `.agents-conf.yaml`, inyecta modelos, crea symlinks)
7. ✅ Implementar `swarm update` (reinjecta modelos si cambió `.agents-conf.yaml`)
8. ✅ Implementar `swarm fallback`, `swarm models`
9. ⬜ Implementar detección de Engram (opcional) en `swarm init`
10. ⬜ Probar `swarm init` en Linux (symlinks)
11. ⬜ Probar `swarm init` en Windows (symlinks o fallback)
12. ⬜ Agregar soporte multi-tool: `--tool claude`, `--tool cursor`
13. ⬜ Probar flujo SDD completo con un feature real
14. ⬜ Compartir con el equipo y refinar
