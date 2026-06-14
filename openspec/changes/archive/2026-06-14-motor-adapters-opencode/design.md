## Context

`soia init` hoy hace dos cosas que este bloque cambia: usa **symlinks** en modo global (rompe Windows) y
**copia** plantillas ya con formato OpenCode (`templates/opencode/`). El objetivo es separar una **fuente
canónica agnóstica** (`templates/canonical/`) y un **motor de adapters** que la **renderiza** al formato y
ruta nativa de cada tool. Este bloque implementa el motor + el **primer adapter (OpenCode)**, dejando todo
listo para Claude (F7). Decidido en exploración: sin migración (pre-release), solo OpenCode, schema de
modelo actual (flat). Base: [ADR 0013](../../docs/decisions/0013-canonical-source-adapters.md).

## Goals / Non-Goals

**Goals:**
- Eliminar symlinks; `init` renderiza/copia (Windows-safe).
- Fuente canónica neutra (frontmatter neutro + cuerpo con tags de inyección).
- Motor de adapters (`types`/`registry`/`opencode`) extensible; `init` resuelve el adapter por tool id.
- El adapter emite agents, skills, commands, context (`AGENTS.md`) y config (`opencode.json`), inyectando
  el modelo durante el render.

**Non-Goals:**
- Adapter Claude / multi-tool / `CLAUDE.md`+`settings.json` (F7).
- Schema de modelo por tool (F29) y eje de esfuerzo.
- Reescritura completa de `update` (F31); acá solo se lo mantiene funcionando.
- Migrar proyectos viejos con symlinks.

## Decisions

### D1 — Formato canónico: frontmatter neutro + tags
Cada agente canónico lleva metadata **neutra**; el adapter la traduce al frontmatter de la tool.

```yaml
# templates/canonical/agents/soia-explorer.md
---
description: Investigates the codebase before any work begins
role: subagent            # primary | subagent
capabilities:             # neutral permissions
  write: true
  edit: false
  bash: true
delegatesTo: []           # e.g. ["soia-*"] para el orchestrator
color: "#6c8ebf"          # hint opcional
---
<body con tags>
```

Mapeo del adapter OpenCode: `role`→`mode`; `capabilities`/`delegatesTo`→`permission`/`tools`;
`color`→`color`. El **modelo no va en el canónico**: el adapter lo inyecta por **agent id** desde
`.agents-conf.yaml` (esto **reemplaza** el marcador-comentario actual; se actualiza `templates.test.ts`).

### D2 — Vocabulario de tags (cuerpo) + placeholders de proyecto
Dos sustituciones distintas:

| Tipo | Ejemplo | Quién resuelve | OpenCode → |
|---|---|---|---|
| **Tag de tool** | `{{soia:delegate:soia-explorer}}` | el **adapter** | `@soia-explorer` |
| | `{{soia:skill:soia-format}}` | el **adapter** | `Load skill \`soia-format\`` |
| **Placeholder de proyecto** | `{{PROJECT_NAME}}`, `{{STACK_RUNTIME}}` | `init` (neutro, igual para todo adapter) | (valor del proyecto) |

El cuerpo canónico se neutraliza: se reemplazan los `@agente` y los "Load skill X" inline por estos tags.

### D3 — Interfaz del motor (`src/lib/adapters/`)
```ts
export type ArtifactKind = 'agent' | 'skill' | 'command' | 'context' | 'config';
export type Scope = 'project' | 'global';

export interface Artifact { kind: ArtifactKind; id: string; meta: Record<string, unknown>; body: string; }
export interface RenderContext { config: agentsconf.Config; projectDir: string; projectName: string; stack: StackInfo; }

export interface ToolAdapter {
  toolId: string;
  getFilePath(a: Artifact, scope: Scope, projectDir: string): string; // ruta nativa
  render(a: Artifact, ctx: RenderContext): string | null;             // null = el adapter no emite ese kind
}
```
`registry.ts` = `AdapterRegistry` (mapa estático: `register/get/getAll/has`), patrón de OpenSpec.

### D4 — Flujo de `init` (reemplaza copia+symlink)
```
1. Resolver config de modelos (global ⊕ local) y datos de proyecto (name, stack).
2. Cargar artefactos canónicos (parsear frontmatter neutro + body) desde templates/canonical/.
3. adapter = registry.get(tool)   (tool = 'opencode' por ahora)
4. Para cada artefacto:  out = adapter.render(artifact, ctx);  si out != null →  write(adapter.getFilePath(artifact, scope, projectDir), out)
5. Escribir .soia/{config,current,.agents-conf}.yaml y soia-spec/ ejemplo (project-local, como hoy).
```
Sin symlinks. Local → `<proj>/.opencode/{agents,skills,commands}/` + `AGENTS.md` + `opencode.json` en raíz.
Global → `~/.config/opencode/{agents,skills,commands}/` (context/config de proyecto siguen project-local).

### D5 — `AGENTS.md` como context neutro single-source
`templates/canonical/context/AGENTS.md` = reglas del proceso + placeholders de proyecto. El adapter OpenCode
lo emite como `AGENTS.md` (OpenCode lo lee nativo, sin wrapper). El `config` de OpenCode (`opencode.json`)
lo emite el mismo adapter. (Claude, en F7, agregará `CLAUDE.md`→`@AGENTS.md` y `settings.json`.)

### D6 — Sin copia central de templates
Se elimina `installCentralTemplates`/`ensureSoiaTemplatesDir` y la carpeta `~/.config/soia/templates/`.
`init` renderiza directo desde el paquete npm. En `~/.config/soia/` queda solo `.agents-conf.yaml`.

## Risks / Trade-offs

- **Tool-isms en el cuerpo que se escapen a los tags** → Mitigación: barrido (grep) de `@`/“Load skill”
  residuales tras neutralizar; test de que el canónico no tiene sintaxis OpenCode.
- **`update.ts` apunta a rutas/inyección viejas** → Mitigación: adaptarlo para re-render por adapter
  (mínimo, sin reescribir todo; F31 lo formaliza). No dejarlo roto.
- **`tests/templates.test.ts` valida el marcador y la ruta `templates/opencode/`** → Mitigación: actualizar
  a `templates/canonical/` y al nuevo contrato (modelo inyectado por adapter, no por marcador).
- **`capabilities` neutro vs lo actual** (hoy unos agentes usan `permission`, otros `tools`) → Mitigación:
  unificar a `capabilities` neutro y que el adapter elija `permission`/`tools` de OpenCode.
- **Cambio de modo global** (de `~/.config/soia/templates`+symlink a `~/.config/opencode/`) → Mitigación:
  sin migración (pre-release); documentar el cambio de comportamiento.

## Migration Plan

No aplica: pre-release, sin usuarios publicados. Proyectos de prueba existentes se regeneran con re-`init`
(o `update`). El cambio de modo global se documenta, no se migra.

## Open Questions

- Mapeo exacto `capabilities` neutro → `permission`/`tools` de OpenCode por agente (se cierra en la
  implementación, mirando cada agente actual).
- ¿`update` mínimo ahora o esperar a F31? Propuesta: parche mínimo para que re-renderice; F31 lo completa.
