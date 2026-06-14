## Why

Hoy `soia init` instala las plantillas con **symlinks** (rompe Windows: requiere Developer Mode/admin) y
está **hardcodeado a OpenCode**, copiando archivos que ya vienen con el formato de OpenCode. Para soportar
**varias herramientas** ([ADR 0013](../../docs/decisions/0013-canonical-source-adapters.md)) y desbloquear
Windows, necesitamos separar una **fuente canónica agnóstica** y un **motor de adapters** que la renderiza
al formato y la ruta nativa de cada tool. Este bloque entrega ese motor con **OpenCode como primer
adapter**; es la base sobre la que se suma Claude (F7) sin reescribir nada.

## What Changes

- **Fuente canónica (F30)**: extraer `templates/opencode/` → `templates/canonical/`, con archivos `.md` de
  **frontmatter neutro** (`role`, `capabilities`, `delegatesTo`, `color` como hint — en vez de
  `mode`/`permission`/`color`/`agent:` de OpenCode), **cuerpo neutralizado** y **tags de inyección** que el
  adapter resuelve (marcador de modelo ya existente, `{{soia:delegate:…}}`, `{{soia:skill:…}}`). Un
  **`AGENTS.md` canónico** con las reglas del proceso + placeholders de proyecto es la única fuente.
- **Motor de adapters (F6)**: nueva carpeta `src/lib/adapters/` con `types.ts` (`Artifact`, `ToolAdapter`,
  `Scope`, `RenderContext`), `registry.ts` (`AdapterRegistry`), `index.ts` y `opencode.ts` (primer adapter).
  El adapter implementa `getFilePath()` + `render()` (resuelve tags, repone frontmatter OpenCode, inyecta
  modelo con el schema **actual** `primary/fallback/temperature`).
- **`init` sin symlinks (F2)** — **BREAKING (interno)**: `init` pasa a **render/copia** vía adapter a la
  ruta nativa. Se elimina `fsutil.createSymlink`. Local → `proyecto/.opencode/{agents,skills,commands}/`;
  global → `~/.config/opencode/{agents,skills,commands}/`. Desaparece la copia central a
  `~/.config/soia/templates/` (en `~/.config/soia/` queda solo `.agents-conf.yaml`). **Sin migración**
  (la herramienta no se publicó aún; re-`init`/`update` regeneran).
- **El adapter emite**: agents, skills, commands, **context (`AGENTS.md`)** y **config (`opencode.json`)**.
- **La inyección de modelo ocurre durante el render** (antes era global en `injector`).

## Capabilities

### New Capabilities
- `tool-adapters`: el contrato del motor de adapters — fuente canónica neutra con tags, render por adapter
  al formato y ruta nativa de cada tool (global o proyecto), sin symlinks, con inyección de modelo en el
  render.

### Modified Capabilities
<!-- workflow-templates (la calidad del contenido canónico) no cambia acá; solo se mueve a templates/canonical/. -->

## Impact

- **Plano**: CLI **y** plantillas.
- **Código**: `src/lib/init.ts` (render vía adapter, sin symlinks), `src/lib/fsutil.ts` (se va
  `createSymlink`), `src/lib/injector.ts` (lo usa el adapter), **nuevo** `src/lib/adapters/`.
  `src/lib/update.ts` debe seguir funcionando (re-render; su formalización completa es F31).
- **Plantillas**: `templates/opencode/` → `templates/canonical/` (mover + neutralizar).
- **Tests**: `tests/templates.test.ts` (apuntar a la ruta canónica, preservar el contrato del marcador) +
  nuevos tests de adapter/render (render → comparar con fixture esperado de OpenCode).
- **Comandos CLI**: cambia la mecánica de `soia init` (rutas, sin symlinks); `update` sigue operativo.
- **Fuera de alcance**: F7 (adapter Claude, `CLAUDE.md`→`@AGENTS.md`, `settings.json`), F29 (model por tool),
  F31 (formalizar `update`), y el eje de esfuerzo (`effort`/`temperature`).
