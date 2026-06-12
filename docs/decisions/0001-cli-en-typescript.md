# ADR 0001 — CLI en TypeScript/Node.js (no Go)

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

El PROPOSAL original describía un CLI mínimo en **Go**. Sin embargo, el equipo domina
**TypeScript/Node.js** y no Go, lo que afectaría mantenibilidad y velocidad de contribución.

## Decisión

Implementar el CLI en **TypeScript + Node.js** (CommonJS). El código en `src/` es la fuente de verdad;
el PROPOSAL queda como visión de producto.

## Consecuencias

- Distribución vía npm (`bin.swarm`), no `go install`.
- Multiplataforma vía Node, sin compilación nativa por SO.
- El equipo puede contribuir sin curva de aprendizaje de un lenguaje nuevo.

## Alternativas consideradas

- **Go** (propuesta original): binario único, pero el equipo no lo domina. Descartada.
