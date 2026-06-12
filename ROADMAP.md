# Roadmap — Swarm-Orchest-IA

> **Mapa vivo** de las funcionalidades del CLI y su estado. Es la "foto" de alto nivel del proyecto:
> un compañero nuevo lee esto primero. El detalle de ejecución vive en los **GitHub Issues** y el
> diseño de cada feature no trivial en **OpenSpec** (`openspec/changes/`).

## Cómo trabajamos (resumen)

Tres capas, una fuente de verdad por capa — sin duplicar info:

| Capa | Pregunta | Dónde |
|---|---|---|
| **Mapa** | ¿Qué hay y en qué estado? | Este archivo (`ROADMAP.md`) |
| **Coordinación** | ¿Quién hace qué? | GitHub Issues + Project board |
| **Especificación** | ¿Qué/por qué/cómo en detalle? | OpenSpec (`/opsx:propose`) |

Flujo: `ROADMAP` → `Issue #N` → (si no trivial) `OpenSpec change` → branch `feat/N` → PR `Closes #N`.
Ver [CONTRIBUTING.md](CONTRIBUTING.md) para el paso a paso.

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente · 🔴 P0 · 🟠 P1 · 🟡 P2 · ⚪ P3

> **Cómo leer este roadmap**: está organizado por **fases de construcción**, no por versiones. El **orden
> de las fases es la prioridad**; dentro de cada fase, los P-levels ordenan el detalle. El objetivo de
> **v1 es OpenCode + Claude Code funcionando** (mismo tier), y lo entregan las Fases 1→3; la Fase 4 lo
> valida. La secuencia central: **organizar templates → `init` + adapters → los demás comandos → validar**.

---

## Hecho (v0.1)

- ✅ CLI `soia init` (inyección de modelos, estructura, modo global/local)
- ✅ CLI `soia update` / `--all`
- ✅ CLI `soia fallback` / `--all` / `--restore`
- ✅ CLI `soia models` / `--primary` / `--fallback`
- ✅ `.agents-conf.yaml` central + override local (merge)
- ✅ Plantillas sin modelo hardcodeado (marcador de inyección) — 6 agentes, 3 skills, 4 comandos
- ✅ F1 — Fix HOME multiplataforma (`os.homedir()`) · [#1](https://github.com/dsquintero/Swarm-Orchest-IA/issues/1)
- ✅ F4 — CI con GitHub Actions (matriz Win/Linux/macOS)
- ✅ F15 — Smoke test de empaquetado (`npm pack` → instalar → CLI) · [#8](https://github.com/dsquintero/Swarm-Orchest-IA/issues/8)
- ✅ F16 — Campo `engines` (`node >=20`) · [#9](https://github.com/dsquintero/Swarm-Orchest-IA/issues/9)
- ✅ F19 — Rebranding `swarm` → `soia` (ADR 0012) · [#12](https://github.com/dsquintero/Swarm-Orchest-IA/issues/12)
- 🟡 Suite de tests (Vitest) — cubre núcleos puros; falta la capa de comandos (ver F3)

> **Aviso**: el workflow SDD canónico (6 agentes + 3 skills + 4 comandos) fue **autogenerado por IA y aún
> no se probó ni se revisó a fondo**. Por eso la **Fase 1** lo pule y la **Fase 4** lo valida antes de v1.

---

## 🧩 Fase 1 — Templates canónicos *(organizar primero)*

> Dejar la fuente canónica **limpia, agnóstica de tool y revisada** antes de tocar el `init`. Ahora es
> viable porque [ADR 0013](docs/decisions/0013-canonical-source-adapters.md) y
> [ADR 0014](docs/decisions/0014-config-neutra-modelo-esfuerzo.md) ya fijaron el formato canónico y las
> divergencias entre herramientas.

| ID | Funcionalidad | Descripción | Prio | Issue |
|---|---|---|---|---|
| F30 | Extraer y organizar `templates/canonical/` | Separar el canónico del *shape* OpenCode (`templates/canonical/{agents,skills,commands,context,defaults}`), definir el formato **agnóstico de tool** y **abstraer el frontmatter** tool-specific (`mode`/`permission`/`color`/`agent:` salen del canónico; los pone cada adapter). Base de todo. Ver [ADR 0013](docs/decisions/0013-canonical-source-adapters.md) | 🔴 | — |
| F24 | Pulir el workflow SDD canónico | Neutralizar el **sesgo .NET/C#** en ejemplos (explorer/specifier/designer/`soia-format`); **deduplicar** la lógica de archive/format/delta triplicada (agente vs comando vs skill) → skills como fuente única; **gatear/quitar** Engram (fuera de alcance). Artefactos canónicos en inglés | 🔴 | — |

## ⚙️ Fase 2 — `init` + motor de adapters

> Renderizar la fuente canónica al formato y la ruta nativa de cada tool (global o proyecto), sin symlinks.
> Toda la arquitectura en [ADR 0013](docs/decisions/0013-canonical-source-adapters.md) y
> [ADR 0014](docs/decisions/0014-config-neutra-modelo-esfuerzo.md).

| ID | Funcionalidad | Descripción | Prio | Issue |
|---|---|---|---|---|
| F29 | Estandarizar config + nuevo schema | Contrato de config por responsabilidad: `config.yaml` (settings: `tool`/`mode`/`language`/`version`) y `.agents-conf.yaml` (**model + `effort` por tool**, mergeable global/local). Agregar `version`; migrar `temperature`→`effort`. Lo consume el render → va **antes** de F6. Ver [ADR 0014](docs/decisions/0014-config-neutra-modelo-esfuerzo.md) | 🟠 | — |
| F2 | `init` render/copia **sin symlinks** | Modo global/local = render/copia a ruta nativa (elimina el bloqueo de Windows). Primer paso del motor, para OpenCode. Ver [ADR 0013](docs/decisions/0013-canonical-source-adapters.md) | 🔴 | [#2](https://github.com/dsquintero/Swarm-Orchest-IA/issues/2) |
| F6 | Motor de adapters **(v1)** | Fuente canónica → **adapter por tool** que renderiza al formato nativo y escribe en su ruta. `init` permite elegir 1+ herramientas (`--tool opencode,claude`). Registry + interfaz `ToolAdapter`. Inyección de model/effort **por adapter** | 🟠 | — |
| F7 | Adapter **Claude Code** **(v1)** | Render al formato y rutas nativas de Claude (`.claude/`, `~/.claude/`). Resuelve las divergencias `effort`/model. **Requerido para v1**, mismo tier que OpenCode | 🟠 | — |
| F25 | Idioma de artefactos parametrizable | `init` pregunta el idioma de los artefactos (ES/ENG; default = **idioma del sistema**), se guarda en `config.yaml`; los agentes generan specs/proposals en ese idioma (los **prompts siguen en inglés**) | 🟠 | — |
| F21 | Modo no-interactivo | `--no-interactive` + helper `isInteractive()` (respeta `CI` y `stdin.isTTY`). Para uso por agentes/CI sin colgarse. Ver [docs/cli-best-practices.md](docs/cli-best-practices.md) | 🟠 | — |
| F22 | `--version` desde `package.json` | Quitar el `'0.1.0'` hardcodeado en `src/cmd/soia.ts` (una sola fuente de verdad) | 🟡 | — |
| F23 | `--no-color` global + hooks | Opción global `--no-color` (estándar `NO_COLOR`) y hooks `preAction`/`postAction` para cross-cutting | 🟡 | — |

## 🔧 Fase 3 — Los demás comandos *(adapter-aware, uno por uno)*

> Que cada comando funcione con el modelo de adapters y el schema nuevo.

| ID | Funcionalidad | Descripción | Prio | Issue |
|---|---|---|---|---|
| F27 | **Eliminar `current.yaml`** / multi-instancia | Quitar el puntero único: el cambio se pasa con **`--change <nombre>`** y el estado vive por cambio en `.status.yaml`. Habilita varias instancias/cambios en paralelo. Implica **reescribir** orquestador + `/soia-propose\|apply\|verify\|archive` | 🟠 | — |
| F31 | Adaptar `update`/`fallback`/`models` | Re-render adapter-aware y schema por tool: `update` re-renderiza por adapter; `fallback`/`models` operan sobre `model`/`effort` **por herramienta** | 🟠 | — |
| F3 | Tests de capa de comandos | Cubrir `init/update/fallback/models` con HOME y projectDir temporales | 🟠 | [#3](https://github.com/dsquintero/Swarm-Orchest-IA/issues/3) |
| F12 | Validación de `.agents-conf.yaml` | Schema + errores claros (nuevo schema de [ADR 0014](docs/decisions/0014-config-neutra-modelo-esfuerzo.md)); incluye migración desde el schema viejo (`temperature` plana) | 🟡 | — |
| F26 | Reforzar el verifier (autoría de tests) | Mantener: implementer escribe y corre tests; verifier **read-only** audita. **Mejora**: rechaza por cobertura faltante y **devuelve al implementer** los escenarios sin test. Conserva construir≠aprobar | 🟡 | — |
| F9 | `soia doctor` | Diagnóstico: HOME, templates, modelos, proyecto válido | 🟡 | — |
| F13 | Contrato de salida `--json` | Salida machine-readable determinista en comandos de lectura (`models`, `fallback`, futuros `list`/`status`) para agentes/tooling. Ver [docs/cli-best-practices.md](docs/cli-best-practices.md) | 🟡 | — |
| F10 | `soia list` / `soia status` | Leer `soia-spec/changes/` y mostrar cambios y fase activa | ⚪ | — |

## ✅ Fase 4 — Validación end-to-end *(gate de v1)*

> Recién acá se valida el flujo real, sobre lo **ya corregido** (no sobre algo con fallas conocidas).

| ID | Funcionalidad | Descripción | Prio | Issue |
|---|---|---|---|---|
| F32 | Corrida de validación real | `soia init` + correr el flujo `/soia-propose…` → apply → verify → archive **punta a punta en OpenCode y Claude**; calibrar `effort`/`temperature` y confirmar que los 6 agentes producen artefactos con sentido | 🔴 | — |
| F14 | Ejemplo end-to-end demostrable | Flujo SDD completo documentado sobre un proyecto real | ⚪ | — |

## 🔭 Post-v1

| ID | Funcionalidad | Descripción | Prio | Issue |
|---|---|---|---|---|
| F8 | Adapter Codex | Ídem sobre el motor de adapters | ⚪ | — |
| F28 | Merge de specs en el CLI | Mover el merge ADDED/MODIFIED/REMOVED del LLM a **código** con validación (robustez del archive) | ⚪ | — |
| F11 | Publicación en npm | `npm install -g swarm-orchest-ia` → comando `soia`; release por CI en tag `vX.Y.Z` | ⚪ | — |
| F20 | Automatización del board (Kanban) | rama→*In progress*, PR→*In review*, merge→*Done* (Projects + Actions con PAT) | ⚪ | — |
| F5 | Limpieza de defaults muertos | Cablear o eliminar `soia.yaml` / `soia-config.yaml` | ⚪ | [#4](https://github.com/dsquintero/Swarm-Orchest-IA/issues/4) |
| F+ | Más adapters | Antigravity, Cursor y otros sobre el motor de adapters (F6) | ⚪ | — |

---

## Fuera de alcance en esta etapa

- **Integración con Engram** (memoria opcional). No se implementa por ahora; se retoma más adelante.
  Se mantiene como visión en `docs/proposal.md`, pero no es trabajo activo.

## Limitaciones conocidas

Ver la sección **Limitaciones conocidas** en [DEVELOPMENT.md](DEVELOPMENT.md#limitaciones-conocidas).

> Al cerrar una funcionalidad, actualizá su fila acá (estado + link al Issue) **en el mismo PR**.
