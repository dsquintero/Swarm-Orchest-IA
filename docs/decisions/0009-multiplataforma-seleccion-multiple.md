# ADR 0009 — Multi-plataforma con selección múltiple

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

El CLI debe preparar un proyecto para distintas herramientas de IA. El PROPOSAL planteaba un único
`--tool` (opencode, luego claude, cursor). El equipo quiere poder preparar un proyecto para **más de
una** plataforma a la vez.

## Decisión

El soporte multi-plataforma se construye sobre una **arquitectura de adapters** por herramienta, y
`init` permitirá **elegir una o varias** (ej. `--tool opencode,claude`). Orden de soporte:
**OpenCode (default, hoy) → Claude → Codex → más adelante** (Cursor y otros se suman incrementalmente).

## Consecuencias

- En esta etapa, OpenCode debe funcionar bien antes de sumar adapters (F6–F8 en ROADMAP).
- Cada plataforma nueva es un adapter aislado, sin reescribir el core.
- Reemplaza la idea de `--tool` único y de `cursor` como segundo objetivo.

## Alternativas consideradas

- **`--tool` único** (propuesta original): más simple pero no permite preparar el proyecto para varias
  herramientas a la vez. Descartada.
