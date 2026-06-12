# ADR 0004 — Orquestación con primitivas nativas de OpenCode

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

Otras herramientas (ej. gentle-ai) introducen un CLI orquestador y componentes propios que agregan
complejidad y curva de aprendizaje.

## Decisión

No construir un orquestador en runtime. Usar lo que **OpenCode ya provee**: `permission.task`,
`mode: subagent`, y `model` por agente. El CLI `swarm` solo prepara la estructura; la orquestación la
hace OpenCode al ejecutar los agentes.

## Consecuencias

- Menos código propio que mantener.
- Cualquier dev que conozca OpenCode entiende el flujo.
- El CLI se enfoca en setup/config, no en ejecución de agentes.

## Alternativas consideradas

- **CLI orquestador propio**: mayor control pero más complejidad y dependencia de un mantenedor.
  Descartada.
