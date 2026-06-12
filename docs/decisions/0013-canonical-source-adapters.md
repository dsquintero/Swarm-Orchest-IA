# ADR 0013 — Fuente canónica + adapters (sin symlinks)

- **Estado**: Aceptada
- **Fecha**: 2026-06-11
- **Supersede (parcialmente)**: [ADR 0006](0006-modo-global-local.md) en cuanto al *mecanismo* (symlinks).

## Contexto

El CLI debe instalar agentes/skills/comandos para **varias herramientas de IA** (OpenCode primero;
luego Claude, Codex, posiblemente Antigravity). El enfoque inicial usaba **symlinks** en modo global.
Dos problemas:

1. **Symlinks en Windows**: requieren Developer Mode/admin; rompen el "instalar y listo".
2. **No resuelven el multi-tool**: cada herramienta tiene un **formato distinto** de agente/comando.
   Un symlink apunta al *mismo archivo*, pero un agente de OpenCode no es válido como agente de Claude
   ni de Codex. No se puede "referenciar entre formatos".

El patrón `@import` (CLAUDE.md → AGENTS.md) solo cubre el **documento de contexto**, no los agentes,
skills ni comandos, que cada tool descubre como archivos propios en su carpeta y su formato.

## Decisión

Adoptar **fuente canónica + adapters**:

- **Una fuente canónica, agnóstica de la herramienta** define cada agente/skill/command (sin formato
  de ninguna tool en particular).
- **Un adapter por herramienta** transforma (renderiza) esa fuente al **formato nativo** de la tool y
  escribe **copias** en su **ruta nativa**:
  - **Modo global** → ruta **global** de la tool (ej. `~/.config/opencode/…`, `~/.claude/…`), para
    que el agente esté disponible en todos los proyectos de esa herramienta.
  - **Modo local** → carpetas del **proyecto** (`.opencode/`, `.claude/`…), autocontenido para commitear.
- **Sin symlinks.** Las carpetas de cada tool son *output generado*, no editado a mano. La
  centralización la da la **fuente única**; la sincronización, `soia update` (re-renderiza).
- El `@import` nativo se usa **dentro de un adapter** donde la tool lo soporte (ej. generar un
  `CLAUDE.md` que importe un `AGENTS.md`), como optimización — no como mecanismo central.

> La inyección de `model`/`temperature` desde `.agents-conf.yaml` ocurre **durante el render**: el
> output ya sale con el modelo correcto por tool/proyecto.

## Estructura concreta (diseño para F6/F7)

El diseño se inspira en el patrón de adapters de [OpenSpec](https://github.com/Fission-AI/OpenSpec)
(`ToolCommandAdapter` + registry estático), **extendido** a nuestras necesidades: 4 tipos de artefacto,
scope global/local e inyección de modelo. Ver también [docs/cli-best-practices.md](../cli-best-practices.md).

### Fuente canónica (templates agnósticos de tool)

Hoy los templates viven bajo `templates/opencode/`, lo que mezcla "canónico" con el *shape* de OpenCode.
F6 separa ambos planos:

```
templates/canonical/
├── agents/     soia-*.md   (con marcador de inyección, SIN frontmatter de tool)
├── skills/     soia-format · soia-delta · soia-archive
├── commands/   soia-propose · apply · verify · archive
├── context/    AGENTS.md canónico
└── defaults/   .agents-conf.yaml, spec de ejemplo, …
```

### Adapters en código

```
src/lib/adapters/
├── types.ts      # ToolAdapter, Artifact, RenderContext, Scope
├── registry.ts   # AdapterRegistry (register/get/getAll/has)
├── index.ts      # re-exports
├── opencode.ts   # opencodeAdapter  (v1)
└── claude.ts     # claudeAdapter    (v1)
```

### Interfaz

```ts
export type ArtifactKind = 'agent' | 'skill' | 'command' | 'context';
export type Scope = 'project' | 'global';

export interface ToolAdapter {
  toolId: string;                                                     // 'opencode' | 'claude'
  getFilePath(a: Artifact, scope: Scope, projectDir: string): string; // ruta NATIVA de la tool
  render(a: Artifact, ctx: RenderContext): string;                    // frontmatter nativo + inyecta model/temperature
}
```

`init`/`update` resuelven el adapter con `AdapterRegistry.get(tool)` y, para cada artefacto canónico,
escriben `render(a, ctx)` en `getFilePath(a, scope, projectDir)`. Esto reemplaza el `if (tool !== 'opencode') throw`
y la rama de symlinks que hoy tiene `src/lib/init.ts`.

### Tabla de rutas nativas

> ⚠️ A **confirmar contra el spec de cada tool** al implementar F7. Las de OpenCode reflejan lo que hoy
> escribe `src/lib/init.ts`.

| Artefacto | OpenCode local | OpenCode global | Claude local | Claude global |
|---|---|---|---|---|
| agent | `.opencode/agent/soia-*.md` | `~/.config/opencode/agent/` | `.claude/agents/soia-*.md` | `~/.claude/agents/` |
| command | `.opencode/command/soia-*.md` | `~/.config/opencode/command/` | `.claude/commands/soia-*.md` | `~/.claude/commands/` |
| skill | `.opencode/skills/<id>/SKILL.md` | `~/.config/opencode/skills/` | `.claude/skills/<id>/SKILL.md` | `~/.claude/skills/` |
| context | `AGENTS.md` (raíz) | — | `CLAUDE.md` → `@AGENTS.md` | `~/.claude/CLAUDE.md` |

### Diferencias deliberadas frente a OpenSpec

1. **Un adapter por tool maneja los 4 `kind`** (OpenSpec separa command-generation de skill-generation;
   para nuestro set chico, unificar es más simple).
2. **La inyección de `model`/`temperature` vive dentro de `render()`** — OpenSpec no inyecta modelos.
3. **`scope` global/local explícito** en `getFilePath()` (ver [ADR 0006](0006-modo-global-local.md));
   OpenSpec es casi todo project-scoped.
4. **Sin symlinks**: `render()` escribe copias a la ruta nativa.
5. **Registry** estático tomado casi literal de OpenSpec (limpio y testeable).

## Consecuencias

- **Elimina el bloqueo de Windows** (nunca se crea un symlink).
- **F2** se replantea: ya no hay "fallback symlink→copia"; el objetivo pasa a ser **quitar los symlinks
  y renderizar/copiar siempre** (primer paso del modelo, para OpenCode).
- **F6** se convierte en el **motor de adapters** (multi-tool), el corazón del diseño.
- Cada adapter (F7 Claude, F8 Codex, + Antigravity) implica **investigar el formato y la ruta nativa
  (global y de proyecto)** de esa herramienta.
- La elección **global/local** de [ADR 0006](0006-modo-global-local.md) se mantiene; lo que cambia es
  que **ambos** modos son render/copia (no symlink). La centralización de [ADR 0002](0002-templates-centralizados.md)
  (un solo origen) sigue vigente.

## Alternativas consideradas

- **Symlinks** (enfoque inicial): frágiles en Windows y no resuelven el multi-formato. Descartado.
- **Solo `@import` nativo**: no cubre agentes/skills/comandos (cada tool los lee como archivos propios).
  Descartado como mecanismo central; se usa como detalle de adapter donde aplique.
