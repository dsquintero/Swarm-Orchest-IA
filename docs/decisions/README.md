# Architecture Decision Records (ADRs)

Registro inmutable de las decisiones de arquitectura, stack, contratos y alcance del proyecto. Una
ADR explica **el porqué** de una decisión, no el cómo (eso vive en los otros docs).

## Cuándo escribir una ADR

Cuando una tarea implique una decisión que afecte arquitectura, stack, un contrato del CLI, o el
alcance del proyecto. **Siempre con confirmación del usuario** antes de crearla.

## Cómo

1. Copiá la estructura de cualquier ADR existente.
2. Numerala secuencialmente (`NNNN-titulo-en-kebab.md`).
3. Estado: `Propuesta` → `Aceptada` → (eventual `Reemplazada por ADR-XXXX`). Las ADRs no se borran;
   se marcan como reemplazadas.

## Índice

| # | Decisión | Estado |
|---|---|---|
| [0001](0001-cli-en-typescript.md) | CLI en TypeScript/Node.js (no Go) | Aceptada |
| [0002](0002-templates-centralizados.md) | Plantillas centralizadas, no copias | Aceptada |
| [0003](0003-modelos-en-agents-conf.md) | Modelos en `.agents-conf.yaml` (sin hardcodear) | Aceptada |
| [0004](0004-opencode-nativo.md) | Orquestación con primitivas nativas de OpenCode | Aceptada |
| [0005](0005-formato-openspec.md) | Formato OpenSpec para specs del producto | Aceptada |
| [0006](0006-modo-global-local.md) | Modo global/local explícito en `init` | Aceptada |
| [0007](0007-swarm-config-marca-proyecto.md) | `.swarm/config.yaml` marca proyecto inicializado | Aceptada |
| [0008](0008-engram-fuera-de-alcance.md) | Engram fuera de alcance en esta etapa | Aceptada |
| [0009](0009-multiplataforma-seleccion-multiple.md) | Multi-plataforma con selección múltiple | Aceptada |
| [0010](0010-documentacion-router-y-docs.md) | AGENTS.md como router + docs on-demand | Aceptada |
