# Glosario

> Términos del proyecto. El malentendido más común es confundir **los dos planos** (la herramienta vs.
> lo que la herramienta genera) — empezá por ahí.

## Los dos planos

- **Este repo (la herramienta)**: acá se desarrolla el CLI `soia` y las plantillas. Para el SDD de
  *nuestro* desarrollo usamos **OpenSpec** (`openspec/`, comandos `/opsx:*`).
- **Proyecto del usuario final (el producto)**: lo que `soia init` genera en otro repo. Usa
  **soia-spec/**, agentes `soia-*` y comandos `/soia-*`.

> Regla rápida: `openspec/` = desarrollo de la herramienta. `soia-spec/` = lo que la herramienta produce.

## Términos

- **CLI `soia`**: el binario de este repo (`init`, `update`, `fallback`, `models`).
- **Agente (`soia-*`)**: archivo Markdown con frontmatter que define un rol del flujo SDD del
  producto (orchestrator, explorer, specifier, designer, implementer, verifier).
- **Orchestrator**: agente coordinador del flujo SDD; delega en sub-agentes vía la herramienta `task`
  de OpenCode. Los sub-agentes no se comunican entre sí.
- **Marcador de inyección**: comentario en el frontmatter de un agente que `injector.ts` reemplaza por
  `model:`/`temperature:`. Ver [templates-system.md](templates-system.md).
- **Modo global / local**: en `init`, ambos **renderizan/copian** (sin symlinks). Global escribe en la
  ruta **global de la tool** (disponible en todos los proyectos); local en el **proyecto**. Ver
  [architecture.md](architecture.md) y [ADR 0013](decisions/0013-canonical-source-adapters.md).
- **primary / fallback**: modelo principal y de respaldo por agente en `.agents-conf.yaml`. Ver
  [models-config.md](models-config.md).
- **Adapter (de plataforma)**: componente que **renderiza** la fuente canónica al formato y la ruta
  nativa de una herramienta de IA (OpenCode hoy; Claude, Codex, Antigravity… después). Es el mecanismo
  central de distribución (sin symlinks). Ver [ADR 0013](decisions/0013-canonical-source-adapters.md)
  y F6–F8 en [ROADMAP.md](../ROADMAP.md).
- **Fuente canónica**: la definición única y agnóstica de cada agente/skill/command, desde la cual los
  adapters generan los outputs por herramienta. Ver [ADR 0013](decisions/0013-canonical-source-adapters.md).
- **soia-spec/**: carpeta de specs y changes del **proyecto del usuario** (formato OpenSpec).
- **OpenSpec**: metodología/CLI de SDD que usamos para desarrollar **este** repo (`/opsx:*`).
- **ADR**: Architecture Decision Record — registro inmutable de una decisión. Ver
  [decisions/](decisions/).
- **Engram**: memoria persistente opcional. **Fuera de alcance en esta etapa** (ver ROADMAP).
- **`opencode-go`**: el proveedor/suscripción de modelos, no el lenguaje del CLI.
