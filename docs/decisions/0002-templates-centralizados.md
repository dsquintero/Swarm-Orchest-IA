# ADR 0002 — Plantillas centralizadas, no copias

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

Cada proyecto necesita los agentes/skills/commands. Copiarlos en cada repo genera redundancia y
desincronización.

## Decisión

Las plantillas viven en un único origen (`~/.config/soia/templates/opencode/`) y los proyectos las
**referencian** (symlinks) en modo global. Filosofía: *referencias > copias; un solo origen*.

## Consecuencias

- Un cambio en las plantillas se propaga con `soia update --all`.
- Se ofrece también un modo **local** (copias) para proyectos que quieran ser autocontenidos
  (ver [ADR 0006](0006-modo-global-local.md)).

## Alternativas consideradas

- **Copiar siempre**: simple pero genera drift entre proyectos. Disponible como modo local opt-in.
