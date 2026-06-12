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
