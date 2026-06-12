# Glosario

> Términos del proyecto. El malentendido más común es confundir **los dos planos** (la herramienta vs.
> lo que la herramienta genera) — empezá por ahí.

## Los dos planos

- **Este repo (la herramienta)**: acá se desarrolla el CLI `swarm` y las plantillas. Para el SDD de
  *nuestro* desarrollo usamos **OpenSpec** (`openspec/`, comandos `/opsx:*`).
- **Proyecto del usuario final (el producto)**: lo que `swarm init` genera en otro repo. Usa
  **swarmspec/**, agentes `swarm-*` y comandos `/swarm-*`.

> Regla rápida: `openspec/` = desarrollo de la herramienta. `swarmspec/` = lo que la herramienta produce.

## Términos

- **CLI `swarm`**: el binario de este repo (`init`, `update`, `fallback`, `models`).
- **Agente (`swarm-*`)**: archivo Markdown con frontmatter que define un rol del flujo SDD del
  producto (orchestrator, explorer, specifier, designer, implementer, verifier).
- **Orchestrator**: agente coordinador del flujo SDD; delega en sub-agentes vía la herramienta `task`
  de OpenCode. Los sub-agentes no se comunican entre sí.
- **Marcador de inyección**: comentario en el frontmatter de un agente que `injector.ts` reemplaza por
  `model:`/`temperature:`. Ver [templates-system.md](templates-system.md).
- **Modo global / local**: en `init`, global usa **symlinks** a plantillas centrales; local **copia**
  todo al proyecto. Ver [architecture.md](architecture.md).
- **primary / fallback**: modelo principal y de respaldo por agente en `.agents-conf.yaml`. Ver
  [models-config.md](models-config.md).
- **Adapter (de plataforma)**: el soporte por herramienta de IA (OpenCode hoy; Claude, Codex y más
  después). Se podrá elegir más de una en `init`. Ver F6–F8 en [ROADMAP.md](../ROADMAP.md).
- **swarmspec/**: carpeta de specs y changes del **proyecto del usuario** (formato OpenSpec).
- **OpenSpec**: metodología/CLI de SDD que usamos para desarrollar **este** repo (`/opsx:*`).
- **ADR**: Architecture Decision Record — registro inmutable de una decisión. Ver
  [decisions/](decisions/).
- **Engram**: memoria persistente opcional. **Fuera de alcance en esta etapa** (ver ROADMAP).
- **`opencode-go`**: el proveedor/suscripción de modelos, no el lenguaje del CLI.
