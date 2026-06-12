# ADR 0005 — Formato OpenSpec para specs del producto

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

El producto necesita un formato de specs probado, entendible y agnóstico de modelo de IA.

## Decisión

Adoptar el formato **OpenSpec**: escenarios GIVEN/WHEN/THEN, keywords SHALL/MUST/SHOULD, y deltas
ADDED/MODIFIED/REMOVED con flujo de archive. Aplica a las specs que genera el producto (`soia-spec/`).

## Consecuencias

- Las skills `soia-format` y `soia-delta` codifican estas reglas.
- El mismo equipo usa OpenSpec (vía `/opsx:*`) para desarrollar **este** repo — dogfooding.

## Alternativas consideradas

- **Formato propio**: reinventar convenciones sin beneficio claro. Descartada.
