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

> La inyección de modelo desde `.agents-conf.yaml` ocurre **durante el render**, **por adapter**: el
> output sale con el `model` en el formato que cada tool espera, y con `temperature` solo donde la tool
> lo soporta (ver "Dos divergencias" más abajo). El output ya sale correcto por tool/proyecto.

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
  render(a: Artifact, ctx: RenderContext): string;                    // frontmatter nativo + inyecta model (y temperature solo si la tool lo soporta)
}
```

`init`/`update` resuelven el adapter con `AdapterRegistry.get(tool)` y, para cada artefacto canónico,
escriben `render(a, ctx)` en `getFilePath(a, scope, projectDir)`. Esto reemplaza el `if (tool !== 'opencode') throw`
y la rama de symlinks que hoy tiene `src/lib/init.ts`.

### Tabla de rutas nativas

> ✅ **Confirmado contra la documentación oficial** de cada tool ([OpenCode](https://opencode.ai/docs),
> [Claude Code](https://code.claude.com/docs/en/overview)). Fechas/links de cada dato en
> "Formatos confirmados" más abajo.

| Artefacto | OpenCode local | OpenCode global | Claude local | Claude global |
|---|---|---|---|---|
| agent | `.opencode/agents/soia-*.md` | `~/.config/opencode/agents/` | `.claude/agents/soia-*.md` | `~/.claude/agents/` |
| command | `.opencode/commands/soia-*.md` | `~/.config/opencode/commands/` | `.claude/commands/soia-*.md` | `~/.claude/commands/` |
| skill | `.opencode/skills/<id>/SKILL.md` | `~/.config/opencode/skills/<id>/SKILL.md` | `.claude/skills/<id>/SKILL.md` | `~/.claude/skills/<id>/SKILL.md` |
| context | `AGENTS.md` (raíz) | `~/.config/opencode/AGENTS.md` | `CLAUDE.md` (raíz) → `@AGENTS.md` | `~/.claude/CLAUDE.md` |

> **Plural, no singular.** OpenCode usa carpetas en **plural** (`agents/`, `commands/`, `skills/`) como
> forma canónica; el singular (`agent/`, `command/`) funciona solo por compatibilidad. Nuestro
> `src/lib/init.ts` ya usa plural. Claude Code: `.claude/commands/` está **deprecado a favor de skills**
> pero sigue funcionando — para v1 lo usamos; migrar a skills es opcional a futuro.

### Formatos confirmados (frontmatter por tool)

El render de cada adapter produce el frontmatter nativo. Diferencias confirmadas en la doc:

**OpenCode** — agentes con frontmatter YAML; `description` es **requerido**; `model` y `temperature`
**ambos soportados** ([agents](https://opencode.ai/docs/agents/)). El `model` va en formato
`provider/model-id` (ej. `anthropic/claude-sonnet-4-...`). Skills = carpeta `<name>/SKILL.md` con
`name`+`description` requeridos ([skills](https://opencode.ai/docs/skills/)). `AGENTS.md` se lee desde la
raíz y desde `~/.config/opencode/AGENTS.md` ([rules](https://opencode.ai/docs/rules)).

**Claude Code** — subagentes con frontmatter YAML; `name`+`description` requeridos; `model` soportado
(alias `sonnet`/`opus`/… o id pelado `claude-opus-4-8` o `inherit`); **`temperature` NO existe** (usa
`effort`: low…max) ([subagents](https://code.claude.com/docs/en/subagents)). Skills =
`<name>/SKILL.md` ([skills](https://code.claude.com/docs/en/skills)). `CLAUDE.md` es **markdown plano sin
frontmatter** y soporta imports `@path` ([memory](https://code.claude.com/docs/en/memory)).

### Scope local (dentro del proyecto)

Ambos modos son render/copia, pero el **modo local** escribe **todo dentro del proyecto** (autocontenido
para commitear). Además de los 4 artefactos (agent/command/skill/context), el proceso local genera dos
piezas que **no** son `kind`:

- **Config de proyecto por tool** — la lee la herramienta desde la raíz/`.<tool>` del repo:
  - OpenCode → `opencode.json` en la raíz ([config](https://opencode.ai/docs/config/)). *Ya lo genera
    `src/lib/init.ts`.*
  - Claude Code → `.claude/settings.json` (+ `.claude/settings.local.json`, gitignored)
    ([settings](https://code.claude.com/docs/en/settings)). Solo si el adapter de Claude lo necesita;
    para nuestro caso el `model` viaja en el frontmatter del agente, así que `settings.json` es opcional.
- **Marca soia (tool-agnóstica)** — `.soia/config.yaml` (proyecto inicializado) y el override local
  `.soia/.agents-conf.yaml`. No dependen de la tool; son contrato del propio CLI.

> En modo local, el `context` de Claude puede ir en la raíz (`CLAUDE.md`) **o** en `.claude/CLAUDE.md`;
> usamos la raíz importando `@AGENTS.md` para no duplicar contexto entre tools.

Tratamos la **config de proyecto** como una responsabilidad del adapter (un quinto output opcional junto
a los 4 `kind`), no como un artefacto canónico: su contenido es propio de cada tool.

### Dos divergencias que el render debe resolver

1. **`temperature` no es universal.** OpenCode lo honra; Claude Code lo ignora (no existe el campo). El
   adapter de Claude debe inyectar **solo `model`** (y, opcionalmente, mapear a `effort`). Hoy
   `src/lib/injector.ts` inyecta `model` + `temperature` juntos: el motor de adapters debe hacer la
   inyección **por adapter**, no global.
2. **El valor de `model` no es portable.** OpenCode espera `provider/model-id`; Claude espera alias / id
   pelado / `inherit`. El `model` de `.agents-conf.yaml` **no se puede copiar tal cual** entre tools: el
   render necesita una **traducción/mapeo de modelo por adapter**. Cómo se almacena el modelo canónico
   (forma neutra + tabla de mapeo, o valores por-tool en `.agents-conf.yaml`) queda como **decisión
   abierta de F6** — ver [docs/models-config.md](../models-config.md).

### Diferencias deliberadas frente a OpenSpec

1. **Un adapter por tool maneja los 4 `kind`** (OpenSpec separa command-generation de skill-generation;
   para nuestro set chico, unificar es más simple).
2. **La inyección de modelo vive dentro de `render()`, por adapter** — OpenSpec no inyecta modelos.
   Cada adapter decide qué campos pone (`temperature` solo OpenCode) y en qué formato va el `model`
   (ver "Dos divergencias" arriba).
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
