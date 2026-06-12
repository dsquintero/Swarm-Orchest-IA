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
| `swarm init [path]` | `lib/init.ts` | Crea la estructura del proyecto; modo **global** (symlinks) o **local** (copias) |
| `swarm update [path]` / `--all` | `lib/update.ts` | Re-inyecta modelos y resincroniza plantillas |
| `swarm fallback [agent]` / `--all` / `--restore` | `lib/fallback.ts` | Cambia agentes a modelo fallback o restaura primary |
| `swarm models [path]` / `--primary` / `--fallback` | `lib/models.ts` | Muestra la config efectiva de modelos |

## Módulos de soporte

- [`lib/agentsconf.ts`](../src/lib/agentsconf.ts) — lee/escribe el `.agents-conf.yaml` global
  (`~/.config/swarm/`) y el override local (`.swarm/.agents-conf.yaml`); `merge` combina ambos.
- [`lib/injector.ts`](../src/lib/injector.ts) — inyecta `model:`/`temperature:` en el frontmatter de
  los agentes reemplazando el comentario marcador. Ver [templates-system.md](templates-system.md).
- [`lib/fsutil.ts`](../src/lib/fsutil.ts) — symlinks/copias, resolución de paths, detección de
  proyecto inicializado.

## Flujo de `swarm init`

1. Asegura `~/.config/swarm/` y `~/.config/swarm/templates/opencode/`.
2. Si no existe el `.agents-conf.yaml` global, lo crea desde `templates/opencode/defaults/`.
3. Pregunta (o recibe por flag) el modo: **global** o **local**.
4. Instala agentes/skills/commands:
   - **global**: copia las plantillas a `~/.config/swarm/templates/opencode/`, inyecta los modelos en
     las plantillas centrales y crea **symlinks** desde `.opencode/` del proyecto.
   - **local**: copia las plantillas al `.opencode/` del proyecto e inyecta los modelos ahí.
5. Genera `AGENTS.md` (con el nombre del proyecto), `opencode.json`, el árbol `swarmspec/` con un spec
   de ejemplo, y los metadatos en `.swarm/` (`config.yaml`, `current.yaml`, `.agents-conf.yaml`).

## Contratos que el CLI espera (no romper)

- **`.swarm/config.yaml`** marca un proyecto inicializado (`isInitialized`). Sin él, `update`,
  `fallback` y `models` fallan con "Not a Swarm project".
- **Resolución de plantillas**: `getTemplatesDir()` busca `templates/opencode/` relativo al paquete
  (sirve en `dist/` y en `src/` con ts-node).
- **Marcador de inyección** en las plantillas de agentes — ver [templates-system.md](templates-system.md).

## Global vs local

| | Global | Local |
|---|---|---|
| Plantillas | Symlinks a `~/.config/swarm/templates/opencode/` | Copias dentro de `.opencode/` |
| Actualización | `swarm update --all` propaga a todos los proyectos | Independiente por proyecto |
| Ideal para | Equipo con plantillas compartidas | Commitear todo al repo del proyecto |
| Windows sin Developer Mode | Falla (symlinks) → usar local | Funciona |

> Ver la ADR de modo global/local en [decisions/](decisions/) y las limitaciones de symlinks en
> Windows en el [README](../README.md#limitaciones-conocidas).
