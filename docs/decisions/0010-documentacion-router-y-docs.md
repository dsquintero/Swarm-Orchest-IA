# ADR 0010 — AGENTS.md como router + docs on-demand

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

`AGENTS.md` se cargaba con todo el detalle (arquitectura, stack, plantillas). Eso recarga el contexto
de los agentes de IA en cada sesión y mezcla "siempre necesario" con "a veces necesario".

## Decisión

Mantener `AGENTS.md` **liviano** como router: solo lo que un agente necesita siempre (qué es el repo,
los dos planos, reglas de colaboración, mini-stack y una tabla de ruteo). El detalle vive en `docs/`
(architecture, technologies, templates-system, models-config, testing, glossary) y se lee **on-demand**.
Las decisiones se registran como **ADRs**.

## Consecuencias

- Menor costo de contexto por sesión; búsqueda dirigida en `docs/` según necesidad.
- Una fuente de verdad por tema, sin duplicar entre AGENTS.md y los docs.
- **Mantenimiento bajo confirmación**: los contribuyentes (personas o agentes) deben **avisar** cuando
  un cambio deja documentación desactualizada y proponer el ajuste; las decisiones se registran como
  ADRs, siempre con confirmación previa del usuario.

## Alternativas consideradas

- **Todo en AGENTS.md**: simple de encontrar pero recarga contexto y crece sin control. Descartada.
- **Wiki externa**: saca la doc del repo y del control de versiones. Descartada.
