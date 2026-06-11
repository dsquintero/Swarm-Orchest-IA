# Swarm-Orchest-IA — Repo de desarrollo

> Este archivo es la fuente canónica de contexto para agentes de IA (OpenCode lee `AGENTS.md`,
> Claude Code lee `CLAUDE.md`, que sólo importa este archivo). Editá **este** archivo, no `CLAUDE.md`.

## Qué es este repositorio

Este repo **es la herramienta** Swarm-Orchest-IA: un orquestador multi-agente de SDD
(Spec-Driven Development) para OpenCode. Contiene el CLI `swarm` y las plantillas que ese CLI
instala en proyectos de terceros.

**Distinción clave — no confundir dos planos:**

| Plano | Qué es | Artefactos |
|---|---|---|
| **Este repo (desarrollo de la herramienta)** | Acá se desarrolla el CLI y las plantillas | Usamos **OpenSpec** (`openspec/`, comandos `/opsx:*`) para el SDD de *nuestro* propio desarrollo |
| **Proyecto del usuario final (output de la herramienta)** | Lo que `swarm init` genera en otro repo | Usa **swarmspec/**, agentes `swarm-*`, comandos `/swarm-*` |

Es decir: cuando desarrollás features de *este* repo, usás OpenSpec. Los agentes `swarm-*` y
`swarmspec/` son el **producto** que generamos, no el flujo con el que trabajamos acá.

> ℹ️ **Stack**: el CLI está implementado en **TypeScript/Node.js** (la stack que el equipo domina).
> `docs/PROPOSAL.md` es la visión de producto y diseño; el código en `src/` es la fuente de
> verdad de la implementación. Ante conflicto, gana el código.

## Stack

- **CLI**: TypeScript + Node.js (CommonJS)
- **Librerías**: Commander.js (parsing), js-yaml (config), inquirer (prompts), ora (spinners), chalk (color)
- **Build**: `tsc` → `dist/`
- **Tests**: Vitest (`tests/*.test.ts`)
- **Formato de specs (producto)**: OpenSpec — GIVEN/WHEN/THEN, SHALL/MUST/SHOULD, deltas ADDED/MODIFIED/REMOVED
- **Modelos (producto)**: OpenCode Go (DeepSeek V4 Pro/Flash, GLM-5/5.1, Kimi K2.6, MiniMax M2.7)

## Estructura del repositorio

```
Swarm-Orchest-IA/                    ← raíz = paquete npm (CLI swarm)
├── src/
│   ├── cmd/swarm.ts                 ← Entry point (Commander)
│   └── lib/                         ← agentsconf, injector, init, update, fallback, models, fsutil
├── templates/opencode/              ← Plantillas CANÓNICAS que instala el CLI (editar acá)
│   ├── agents/                      ← 6 agentes swarm-* (sin model/temperature hardcodeado)
│   ├── skills/                      ← swarm-format, swarm-delta, swarm-archive
│   ├── commands/                    ← swarm-propose, swarm-apply, swarm-verify, swarm-archive
│   └── defaults/                    ← .agents-conf.yaml, AGENTS.md, opencode.json, spec ejemplo
├── tests/                           ← Tests con Vitest (injector, agentsconf, fsutil, templates)
├── docs/
│   ├── PROPOSAL.md                  ← Visión de producto y diseño (alineado con la implementación TS)
│   └── _prototype/                  ← Plantillas originales de referencia (NO editar; histórico)
│       ├── defaults/
│       └── templates/opencode/
├── openspec/                        ← SDD de ESTE repo (specs y changes de la herramienta)
│   ├── config.yaml
│   ├── specs/
│   └── changes/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── AGENTS.md                        ← este archivo (fuente canónica)
├── CLAUDE.md                        ← importa AGENTS.md
└── README.md
```

> `templates/opencode/` es la copia **canónica**. `docs/_prototype/` es referencia
> histórica congelada — los cambios reales van en `templates/`.

## Arquitectura del CLI

Entry point `src/cmd/swarm.ts` registra 4 comandos vía Commander:

| Comando | Lib | Qué hace |
|---|---|---|
| `swarm init [path]` | `lib/init.ts` | Crea estructura del proyecto; modo **global** (symlinks a `~/.config/swarm/templates/`) o **local** (copias) |
| `swarm update [path]` / `--all` | `lib/update.ts` | Re-inyecta modelos y resincroniza plantillas |
| `swarm fallback [agent]` / `--all` / `--restore` | `lib/fallback.ts` | Cambia agentes a modelo fallback o restaura primary |
| `swarm models [path]` / `--primary` / `--fallback` | `lib/models.ts` | Muestra config de modelos por agente |

Módulos de soporte:
- `lib/agentsconf.ts` — lee/escribe `~/.config/swarm/.agents-conf.yaml` y override local `.swarm/.agents-conf.yaml`
- `lib/injector.ts` — inyecta `model:`/`temperature:` en el frontmatter de los agentes reemplazando el comentario marcador
- `lib/fsutil.ts` — symlinks/copias, resolución de paths, detección de proyecto inicializado (`.swarm/config.yaml`)

**Concepto central**: las plantillas de agentes NO tienen `model:` hardcodeado; llevan un comentario
marcador que `injector.ts` reemplaza con los valores de `.agents-conf.yaml` durante `init`/`update`.

## Comandos de desarrollo

```bash
npm install              # Instalar dependencias (desde la raíz del repo)
npm run build            # Compilar TS → dist/
npm run dev -- <cmd>     # Ejecutar con ts-node sin compilar (ej: npm run dev -- init /tmp/test)
npm start -- <cmd>       # Ejecutar versión compilada
npm test                 # Correr la suite de tests (Vitest)
npm run test:watch       # Tests en modo watch
npm run coverage         # Tests con reporte de cobertura
```

**Tests**: usamos **Vitest**. Viven en `tests/*.test.ts` y cubren los núcleos puros
(`injector`, `agentsconf`, `fsutil`) más un test de integridad de plantillas que verifica que los
6 agentes mantengan el marcador de inyección de modelo. Al agregar features, añadí tests.

## Convenciones

- **Lenguaje del código y comentarios**: el código está en inglés; la documentación de usuario y
  los mensajes del proposal están en español. Mantené el idioma del archivo que estés tocando.
- **Sin dependencias nuevas** salvo justificación clara (mantener el CLI liviano es un objetivo explícito).
- **Plantillas**: editá `templates/opencode/`, no `docs/_prototype/`.
- **Filosofía** (del proposal): referencias > copias; un solo origen de plantillas; usar lo que
  OpenCode ya provee; Engram opcional.
- No rompas el contrato de paths que el CLI espera: `.swarm/config.yaml` marca un proyecto inicializado.

## Flujo de desarrollo con OpenSpec (para este repo)

Para evolucionar el CLI y las plantillas, usá el workflow OpenSpec:

1. `/opsx:propose <descripción>` — crea un change con `proposal.md`, `design.md`, `tasks.md`
2. `/opsx:apply` — implementá las tareas del change
3. `/opsx:archive` — archivá el change y mergeá specs

Comandos OpenSpec CLI: `openspec new change "<name>"`, `openspec status --change "<name>" --json`,
`openspec instructions <artifact> --change "<name>" --json`.

El contexto del proyecto para OpenSpec vive en `openspec/config.yaml`.

## Roadmap (de PROPOSAL.md)

Hecho: proposal, plantillas base, agentes refinados, defaults, CLI `init/update/fallback/models`.
Pendiente: detección de Engram, pruebas multiplataforma de symlinks (Win/Linux), soporte
`--tool claude` y `--tool cursor`, prueba del flujo SDD completo con un feature real.
