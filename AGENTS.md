# Swarm-Orchest-IA — Repo de desarrollo

> Este archivo es la fuente canónica de contexto para agentes de IA (OpenCode lee `AGENTS.md`,
> Claude Code lee `CLAUDE.md`, que sólo importa este archivo). Editá **este** archivo, no `CLAUDE.md`.

## Qué es este repositorio

Este repo **es la herramienta** Swarm-Orchest-IA: un orquestador multi-agente de SDD
(Spec-Driven Development) **agnóstico de la herramienta** (OpenCode es el primer soporte; se
agregarán más). Contiene el CLI `swarm` y las plantillas que ese CLI instala en proyectos de terceros.

**Distinción clave — no confundir dos planos:**

| Plano | Qué es | Artefactos |
|---|---|---|
| **Este repo (desarrollo de la herramienta)** | Acá se desarrolla el CLI y las plantillas | Usamos **OpenSpec** (`openspec/`, comandos `/opsx:*`) para el SDD de *nuestro* propio desarrollo |
| **Proyecto del usuario final (output de la herramienta)** | Lo que `swarm init` genera en otro repo | Usa **swarmspec/**, agentes `swarm-*`, comandos `/swarm-*` |

Es decir: cuando desarrollás features de *este* repo, usás OpenSpec. Los agentes `swarm-*` y
`swarmspec/` son el **producto** que generamos, no el flujo con el que trabajamos acá.

> ℹ️ **Stack**: el CLI está implementado en **TypeScript/Node.js** (la stack que el equipo domina).
> `docs/proposal.md` es la visión de producto y diseño; el código en `src/` es la fuente de
> verdad de la implementación. Ante conflicto, gana el código.

## Stack (resumen)

**TypeScript + Node.js** (CommonJS), Commander + js-yaml + inquirer + ora + chalk. Build con `tsc`,
tests con **Vitest**. El detalle y el porqué de cada pieza viven en
[docs/technologies.md](docs/technologies.md).

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
├── docs/                            ← documentación (router + detalle); índice en docs/README.md
│   ├── proposal.md                  ← visión de producto original
│   ├── usage / architecture / …     ← guías por tema (ver docs/README.md)
│   └── decisions/                   ← ADRs (el porqué de cada decisión)
├── openspec/                        ← SDD de ESTE repo (specs y changes de la herramienta)
│   ├── config.yaml
│   ├── specs/
│   └── changes/
├── .github/                         ← plantillas de Issue/PR + CI (GitHub Actions)
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── ROADMAP.md                       ← mapa vivo de funcionalidades (estado por feature)
├── CONTRIBUTING.md                  ← guía de colaboración (flujo, convenciones)
├── AGENTS.md                        ← este archivo (fuente canónica)
├── CLAUDE.md                        ← importa AGENTS.md
└── README.md
```

> `templates/opencode/` es la copia **canónica** que instala el CLI. Editá ahí.

## Documentación — leé según necesidad

`AGENTS.md` es un **router liviano**. El detalle vive en `docs/` y se lee on-demand (no hace falta
cargarlo todo de entrada):

| Necesitás… | Leé |
|---|---|
| Arquitectura del CLI (módulos, flujo, contratos de paths) | [docs/architecture.md](docs/architecture.md) |
| Qué librería se usa y por qué | [docs/technologies.md](docs/technologies.md) |
| Tocar plantillas / el marcador de inyección de modelo | [docs/templates-system.md](docs/templates-system.md) |
| Cambiar modelos / config primary-fallback | [docs/models-config.md](docs/models-config.md) |
| Escribir o entender tests | [docs/testing.md](docs/testing.md) |
| Términos del dominio (los dos planos, adapters…) | [docs/glossary.md](docs/glossary.md) |
| **Por qué** se tomó una decisión | [docs/decisions/](docs/decisions/) (ADRs) |
| Visión de producto | [docs/proposal.md](docs/proposal.md) |
| Flujo de colaboración / convenciones | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Estado y roadmap | [ROADMAP.md](ROADMAP.md) |
| Índice completo de docs | [docs/README.md](docs/README.md) |

**Concepto central** (lo único que conviene tener siempre presente): las plantillas de agentes NO
tienen `model:` hardcodeado; llevan un marcador que `injector.ts` reemplaza desde `.agents-conf.yaml`
durante `init`/`update`.

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

**Tests**: Vitest en `tests/*.test.ts`. Al agregar features, añadí tests. Estrategia y detalle en
[docs/testing.md](docs/testing.md).

## Convenciones

- **Lenguaje del código y comentarios**: el código está en inglés; la documentación de usuario y
  los mensajes del proposal están en español. Mantené el idioma del archivo que estés tocando.
- **Sin dependencias nuevas** salvo justificación clara (mantener el CLI liviano es un objetivo explícito).
- **Plantillas**: editá `templates/opencode/` (es la copia canónica que instala el CLI).
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

## Cómo colaborar en este repo (agentes y personas)

Este repo es **colaborativo**: varias personas y agentes de IA trabajan sobre él. Seguí este flujo
para no pisar a nadie. El detalle completo está en [CONTRIBUTING.md](CONTRIBUTING.md); el mapa de
funcionalidades en [ROADMAP.md](ROADMAP.md).

```
ROADMAP.md → Issue #N → (si no trivial) /opsx:propose → feature/N desde develop → PR a develop "Closes #N" → CI verde → merge
```

**Modelo de ramas (GitFlow)**: `main` (producción, solo releases, protegida) · `develop` (integración,
**rama default**, protegida) · `feature/*` y `bugfix/*` salen de `develop` y vuelven por PR · `release/X.Y.Z`
y `hotfix/X.Y.Z` son temporales y las maneja quien hace el release. Detalle en [CONTRIBUTING.md](CONTRIBUTING.md).

**Reglas para agentes de IA (obligatorias):**

1. **Arrancá con un objetivo claro**: leé `ROADMAP.md` y el Issue asignado antes de tocar código. No
   empieces sin un Issue o instrucción explícita.
2. **Elegí el peso del proceso**:
   - Feature **no trivial** (comando nuevo, cambia comportamiento) → `/opsx:propose` primero
     (genera `proposal/design/tasks` en `openspec/changes/`).
   - Bug fix, refactor chico, docs o ajuste de plantilla → Issue + PR directo, **sin** OpenSpec.
3. **Branch desde `develop`, nunca commits directos a `main`/`develop`**: `feature/<n>-<slug>` (o
   `bugfix/<n>-<slug>`). El PR va **hacia `develop`**.
4. **Tests + verde**: agregá/actualizá tests (Vitest) para toda lógica nueva. `npm test` y
   `npm run build` deben pasar antes de proponer el merge.
5. **No rompas los contratos del repo**:
   - El marcador de inyección de modelo en las plantillas de agentes (lo protege `tests/templates.test.ts`).
   - `.swarm/config.yaml` como marca de proyecto inicializado.
6. **Conventional commits** (`feat/fix/chore/test/docs/refactor`) y **PRs chicos**: 1 feature por PR.
7. **Actualizá `ROADMAP.md`** (estado + link al Issue) en el **mismo PR** que cierra la feature.
8. Usá las plantillas de Issue/PR de `.github/` y referenciá el Issue (`Closes #N`).

**Documentación y decisiones (mantener al día):**

- **Registrá decisiones como ADRs**: si la tarea implica una decisión de arquitectura, stack, contrato
  o alcance, proponé crear/actualizar una ADR en [docs/decisions/](docs/decisions/). Creala solo tras
  confirmación del usuario.
- **Notificá desfases siempre**: si un cambio deja desactualizado algún doc (`docs/*`, `AGENTS.md`,
  `ROADMAP.md`, `README.md`, `CONTRIBUTING.md`), **avisá** qué quedó desfasado y proponé el ajuste —
  aunque no se aplique en el momento, la notificación es obligatoria.
- **Siempre con confirmación previa**: no crees ni edites documentación ni ADRs sin el OK del usuario.

**Pedí confirmación al usuario antes de**: pushear, abrir o mergear PRs, crear Issues, y crear/editar
documentación o ADRs. Esas acciones no las hace un agente por su cuenta.

## Roadmap

El estado por funcionalidad vive en [ROADMAP.md](ROADMAP.md) (mapa vivo). `docs/proposal.md` es la
visión de producto original.
