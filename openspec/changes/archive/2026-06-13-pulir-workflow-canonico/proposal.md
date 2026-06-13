## Why

El workflow SDD canónico (6 agentes + 3 skills + 4 comandos en `templates/opencode/`) fue
**autogenerado por IA y nunca se revisó ni se probó**. Hoy tiene tres problemas que lo hacen frágil:
un **sesgo fuerte a .NET/C#** en los ejemplos (contradice el objetivo de ser agnóstico de stack), la
**lógica de archive/format/delta triplicada** (agente + comando + skill → se desincroniza), y
**referencias inline a Engram** que está fuera de alcance ([ADR 0008](../../docs/decisions/0008-engram-fuera-de-alcance.md)).
Hay que limpiarlo **antes** de construir el motor de adapters (Fase 2) y de la validación end-to-end (F32),
para no pulir sobre algo que después se reescribe.

## What Changes

- **De-sesgar .NET/C#**: reemplazar los ejemplos `ASP.NET`/`MediatR`/`EF`/`FluentValidation` por
  ejemplos **genéricos/neutros** y reforzar "seguí las convenciones de `AGENTS.md` del proyecto". Afecta
  `soia-explorer`, `soia-specifier`, `soia-designer` y la skill `soia-format`.
- **Deduplicar lógica triplicada**: las skills (`soia-format`, `soia-delta`, `soia-archive`) pasan a ser
  la **única fuente** de las reglas de formato/delta/archivado; el agente `soia-orchestrator` y el
  comando `soia-archive` las **referencian** en vez de inlinearlas.
- **Quitar Engram por completo**: eliminar **toda** referencia a Engram de los agentes (sin dejar ni una
  mención opcional). `soia init` no detecta Engram, así que los prompts no deben referenciar una capacidad
  inexistente ([ADR 0008](../../docs/decisions/0008-engram-fuera-de-alcance.md)).
- **NO BREAKING**: es pulido **en sitio** sobre `templates/opencode/`. El `init` sigue copiando los
  mismos archivos a `.opencode/`; no cambia el comportamiento del CLI.

Fuera de alcance (Fase 2, con F6): F30 — extraer `templates/canonical/` y abstraer el frontmatter
tool-specific (`mode`/`permission`/`color`). Su implementación rompe el `init` sin el motor de adapters.

## Capabilities

### New Capabilities
- `workflow-templates`: requisitos de calidad del workflow SDD canónico que instala el CLI — agnóstico de
  stack, skills como única fuente de las reglas, sin Engram inline, y preservando el marcador de inyección
  de modelo en el frontmatter de los agentes.

### Modified Capabilities
<!-- No hay specs existentes en openspec/specs/ — esta es la primera capability. -->

## Impact

- **Plano afectado**: **plantillas** (`templates/opencode/`), no el CLI.
  - Agentes: `soia-orchestrator`, `soia-explorer`, `soia-specifier`, `soia-designer` (implementer/verifier
    solo si tienen sesgo o Engram).
  - Skills: `soia-format`, `soia-delta`, `soia-archive`.
  - Comandos: `soia-archive` (y los demás si inlinean reglas).
- **CLI**: sin cambios en `soia init/update/fallback/models` — el contenido se copia tal cual.
- **Contrato duro**: el **marcador de inyección de modelo** en el frontmatter de los agentes debe
  preservarse (lo protege `tests/templates.test.ts`). Idioma de los archivos: inglés.
