# ADR 0009 — Multi-plataforma con selección múltiple

- **Estado**: Aceptada
- **Fecha**: 2026-06-11 (actualizada 2026-06-12: v1 sale con OpenCode **y** Claude Code)

## Contexto

El CLI debe preparar un proyecto para distintas herramientas de IA. El PROPOSAL planteaba un único
`--tool` (opencode, luego claude, cursor). El equipo quiere poder preparar un proyecto para **más de
una** plataforma a la vez, y que el producto **no salga atado a una sola herramienta**.

## Decisión

El soporte multi-plataforma se construye sobre una **arquitectura de adapters** por herramienta
(ver [ADR 0013](0013-canonical-source-adapters.md)), e `init` permite **elegir una o varias**
(ej. `--tool opencode,claude`).

La **primera versión (v1) sale con dos adapters: OpenCode + Claude Code**, ambos funcionando — son el
**mismo tier**, no "OpenCode primero y Claude después". **Codex** y **Antigravity** se suman más adelante.

## Consecuencias

- v1 requiere: el **motor de adapters** (F6) + los adapters de **OpenCode y Claude** funcionando (F7).
- Cada plataforma nueva (Codex, Antigravity, Cursor…) es un adapter aislado, sin reescribir el core.
- Reemplaza la idea de `--tool` único, de `cursor` como segundo objetivo, y del enfoque "OpenCode primero".

## Alternativas consideradas

- **`--tool` único** (propuesta original): más simple pero no permite preparar el proyecto para varias
  herramientas a la vez. Descartada.
