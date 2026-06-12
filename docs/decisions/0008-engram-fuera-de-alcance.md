# ADR 0008 — Engram fuera de alcance en esta etapa

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

El PROPOSAL contempla **Engram** como memoria persistente opcional, con detección e integración en
`swarm init`. En la etapa actual el foco es que el flujo base funcione bien en OpenCode.

## Decisión

**No** implementar la integración con Engram por ahora. Se mantiene como visión de producto en el
PROPOSAL, pero no es trabajo activo ni aparece en el roadmap como tarea.

## Consecuencias

- `swarm init` no pregunta por Engram ni lo detecta.
- Reduce alcance y complejidad mientras se estabiliza el núcleo y el soporte multi-plataforma.
- Se puede retomar más adelante con una nueva ADR que reemplace o complemente a esta.

## Alternativas consideradas

- **Implementar Engram ahora**: agrega superficie y dependencia sin ser crítico para el flujo base.
  Pospuesta.
