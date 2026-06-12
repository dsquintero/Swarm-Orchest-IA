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

---

## Hecho (v0.1)

- ✅ CLI `soia init` (inyección de modelos, estructura, modo global/local)
- ✅ CLI `soia update` / `--all`
- ✅ CLI `soia fallback` / `--all` / `--restore`
- ✅ CLI `soia models` / `--primary` / `--fallback`
- ✅ `.agents-conf.yaml` central + override local (merge)
- ✅ Plantillas sin modelo hardcodeado (marcador de inyección) — 6 agentes, 3 skills, 4 comandos
- 🟡 Suite de tests (Vitest) — cubre núcleos puros; falta la capa de comandos

---

## v0.2 — Correctez y robustez

> Desbloquea Windows y la colaboración. Atacar primero.

| ID | Funcionalidad | Descripción | Prio | Issue |
|---|---|---|---|---|
| F1 | ✅ Fix HOME multiplataforma | Usar `os.homedir()` en vez del fallback POSIX hardcodeado de `process.env.HOME` — **hecho** | 🔴 | [#1](https://github.com/dsquintero/Swarm-Orchest-IA/issues/1) |
| F2 | Quitar symlinks (render/copia) | Modo global/local = render/copia a ruta nativa, **sin symlinks** (elimina el bloqueo de Windows). Primer paso del modelo de adapters, para OpenCode. Ver ADR 0013 | 🔴 | [#2](https://github.com/dsquintero/Swarm-Orchest-IA/issues/2) |
| F3 | Tests de capa de comandos | Cubrir `init/update/fallback/models` con HOME y projectDir temporales | 🟠 | [#3](https://github.com/dsquintero/Swarm-Orchest-IA/issues/3) |
| F4 | ✅ CI con GitHub Actions | `npm test` + `build` en cada PR (matriz Win/Linux/macOS) — **hecho** (`.github/workflows/ci.yml`) | 🟠 | — |
| F5 | Limpieza de defaults muertos | Cablear o eliminar `soia.yaml` / `soia-config.yaml` | 🟡 | [#4](https://github.com/dsquintero/Swarm-Orchest-IA/issues/4) |
| F15 | ✅ Smoke test de empaquetado | En CI: `npm pack` → instalar el tarball → CLI `--version` + `init` en proyecto temporal — **hecho** (`.github/workflows/smoke-test.yml`) | 🟠 | [#8](https://github.com/dsquintero/Swarm-Orchest-IA/issues/8) |
| F16 | ✅ Campo `engines` en package.json | Declarar `node >=20` para un mensaje claro con Node viejo — **hecho** | 🟡 | [#9](https://github.com/dsquintero/Swarm-Orchest-IA/issues/9) |

## v0.3 — Multi-plataforma (objetivo **v1: OpenCode + Claude Code**)

> La **primera versión sale con dos adapters: OpenCode + Claude Code**, ambos funcionando — mismo tier,
> no "OpenCode primero". La base de OpenCode viene de **F2** (render/copia); el **motor de adapters** es
> **F6** y el **adapter de Claude** es **F7**: los tres son **requeridos para v1**. Codex y Antigravity
> se suman después. Todo sobre la arquitectura de adapters ([ADR 0013](docs/decisions/0013-canonical-source-adapters.md), [ADR 0009](docs/decisions/0009-multiplataforma-seleccion-multiple.md)).

| ID | Funcionalidad | Descripción | Prio | Issue |
|---|---|---|---|---|
| F6 | Motor de adapters **(v1)** | Fuente canónica → **adapter por tool** que renderiza al formato nativo y escribe en su ruta (global o proyecto). `init` permite elegir 1+ herramientas (`--tool opencode,claude`). Base de v1. Ver ADR 0013 | 🟠 | — |
| F7 | Adapter Claude Code **(v1)** | Render al formato y rutas nativas de Claude Code (`.claude/`, `~/.claude/`). **Requerido para v1**, mismo tier que OpenCode | 🟠 | — |
| F8 | Adapter Codex | Ídem para Codex (post-v1) | ⚪ | — |
| F9 | `soia doctor` | Diagnóstico: HOME, templates, modelos, proyecto válido | 🟡 | — |
| F+ | Más adapters (post-v1) | Antigravity, Cursor y otros — se suman sobre el motor de adapters (F6) | ⚪ | — |

## v0.4 — DX y distribución

| ID | Funcionalidad | Descripción | Prio | Issue |
|---|---|---|---|---|
| F10 | `soia list` / `soia status` | Leer `soia-spec/changes/` y mostrar cambios y fase activa | ⚪ | — |
| F11 | Publicación en npm | `npm install -g swarm-orchest-ia` → comando `soia`; release automatizado por CI en tag `vX.Y.Z` | ⚪ | — |
| F12 | Validación de `.agents-conf.yaml` | Schema + errores claros si falta `primary/fallback/temperature` | ⚪ | — |
| F13 | `soia models --json` | Salida machine-readable para tooling | ⚪ | — |
| F14 | Ejemplo .NET 8 end-to-end | Flujo SDD completo demostrado | ⚪ | — |
| F19 | ✅ Rebranding `swarm` → `soia` | Nombre corto universal (comando, agentes, carpetas, contratos). Marca y paquete `swarm-orchest-ia` intactos. Ver ADR 0012 — **hecho** | 🟠 | [#12](https://github.com/dsquintero/Swarm-Orchest-IA/issues/12) |
| F20 | Automatización del board (Kanban) | rama→*In progress*, PR→*In review*, merge→*Done*. Workflows nativos de Projects + GitHub Actions (con PAT) usando la convención `feature/<n>-…` | ⚪ | — |

---

## Fuera de alcance en esta etapa

- **Integración con Engram** (memoria opcional). No se implementa por ahora; se retoma más adelante.
  Se mantiene como visión en `docs/proposal.md`, pero no es trabajo activo.

## Limitaciones conocidas

Ver la sección **Limitaciones conocidas** en [DEVELOPMENT.md](DEVELOPMENT.md#limitaciones-conocidas).

> Al cerrar una funcionalidad, actualizá su fila acá (estado + link al Issue) **en el mismo PR**.
