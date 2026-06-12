# ADR 0003 — Modelos en `.agents-conf.yaml` (sin hardcodear)

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

Cada agente usa un modelo distinto y los modelos cambian (costos, disponibilidad). Hardcodearlos en
las plantillas obliga a editar muchos archivos.

## Decisión

Los modelos viven en `.agents-conf.yaml` (global + override local por proyecto) con `primary`,
`fallback` y `temperature` por agente. Las plantillas llevan un **marcador** que `injector.ts`
reemplaza en `init`/`update`. Ver [templates-system.md](../templates-system.md) y
[models-config.md](../models-config.md).

## Consecuencias

- Cambiar un modelo para todos los agentes es editar una línea.
- Override por proyecto sin tocar las plantillas centrales.
- **Contrato a proteger**: el texto del marcador debe coincidir entre `injector.ts` y las plantillas
  (lo cubre `tests/templates.test.ts`).

## Alternativas consideradas

- **Modelo hardcodeado en cada plantilla**: simple pero rígido y propenso a drift. Descartada.
