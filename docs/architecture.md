# Arquitectura del CLI

> Cómo está armado el CLI `swarm`. Para el sistema de plantillas en detalle ver
> [templates-system.md](templates-system.md); para la config de modelos ver
> [models-config.md](models-config.md).

## Entry point

[`src/cmd/swarm.ts`](../src/cmd/swarm.ts) registra 4 comandos vía **Commander**. Cada comando
resuelve el directorio del proyecto (`resolveProjectDir`), valida que sea (o no) un proyecto Swarm
(`isInitialized`) y delega a su módulo en `lib/`.

| Comando | Lib | Qué hace |
|---|---|---|
| `swarm init [path]` | `lib/init.ts` | Crea la estructura del proyecto; modo **global** o **local** (render/copia a ruta nativa — ver [ADR 0013](decisions/0013-canonical-source-adapters.md)) |
| `swarm update [path]` / `--all` | `lib/update.ts` | Re-inyecta modelos y resincroniza plantillas |
| `swarm fallback [agent]` / `--all` / `--restore` | `lib/fallback.ts` | Cambia agentes a modelo fallback o restaura primary |
| `swarm models [path]` / `--primary` / `--fallback` | `lib/models.ts` | Muestra la config efectiva de modelos |

## Módulos de soporte

- [`lib/agentsconf.ts`](../src/lib/agentsconf.ts) — lee/escribe el `.agents-conf.yaml` global
  (`~/.config/swarm/`) y el override local (`.swarm/.agents-conf.yaml`); `merge` combina ambos.
- [`lib/injector.ts`](../src/lib/injector.ts) — inyecta `model:`/`temperature:` en el frontmatter de
  los agentes reemplazando el comentario marcador. Ver [templates-system.md](templates-system.md).
- [`lib/fsutil.ts`](../src/lib/fsutil.ts) — copias, resolución de paths, detección de proyecto
  inicializado (incluye un helper de symlink **legacy, en remoción** por [ADR 0013](decisions/0013-canonical-source-adapters.md)).

## Flujo de `swarm init`

1. Asegura `~/.config/swarm/` y `~/.config/swarm/templates/opencode/`.
2. Si no existe el `.agents-conf.yaml` global, lo crea desde `templates/opencode/defaults/`.
3. Pregunta (o recibe por flag) el modo: **global** o **local**.
4. Instala agentes/skills/commands **renderizándolos al formato nativo de la tool** (sin symlinks; ver
   [ADR 0013](decisions/0013-canonical-source-adapters.md)). La inyección de `model`/`temperature`
   ocurre durante el render:
   - **global**: render/copia a la **ruta global de la tool** (ej. `~/.config/opencode/…`), disponible
     en todos los proyectos de esa herramienta.
   - **local**: render/copia a las carpetas del **proyecto** (`.opencode/…`), autocontenido para commitear.
5. Genera `AGENTS.md` (con el nombre del proyecto), `opencode.json`, el árbol `swarmspec/` con un spec
   de ejemplo, y los metadatos en `.swarm/` (`config.yaml`, `current.yaml`, `.agents-conf.yaml`).

## Contratos que el CLI espera (no romper)

- **`.swarm/config.yaml`** marca un proyecto inicializado (`isInitialized`). Sin él, `update`,
  `fallback` y `models` fallan con "Not a Swarm project".
- **Resolución de plantillas**: `getTemplatesDir()` busca `templates/opencode/` relativo al paquete
  (sirve en `dist/` y en `src/` con ts-node).
- **Marcador de inyección** en las plantillas de agentes — ver [templates-system.md](templates-system.md).

## Global vs local

Ambos modos **renderizan/copian** (sin symlinks). Difieren en **dónde** escriben:

| | Global | Local |
|---|---|---|
| Dónde | Ruta global de la tool (ej. `~/.config/opencode/…`) | Carpetas del proyecto (`.opencode/…`) |
| Disponible en | Todos los proyectos de esa herramienta | Solo este proyecto |
| Ideal para | Usar los mismos agentes en todos lados | Commitear todo al repo del proyecto |
| Sincronización | `swarm update` re-renderiza | Ídem, por proyecto |

> ⚠️ **En migración** ([ADR 0013](decisions/0013-canonical-source-adapters.md) / F2): la implementación
> actual todavía usa **symlinks** en modo global; se está pasando a render/copia a ruta nativa, y a un
> **adapter por herramienta** (F6).
