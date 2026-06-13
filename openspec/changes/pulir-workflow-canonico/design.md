## Context

El workflow SDD canónico vive en `templates/opencode/` (6 agentes, 3 skills, 4 comandos) y es el
**producto** que instala `soia init`. Fue autogenerado y nunca revisado. Esta fase lo pule **en sitio**,
sin tocar el CLI ni la estructura de carpetas (la extracción a `templates/canonical/` y la abstracción de
frontmatter son F30/F6, Fase 2). El `init` copia estos archivos tal cual, así que cualquier cambio de
contenido se refleja directo en el output sin tocar código.

## Goals / Non-Goals

**Goals:**
- Eliminar el sesgo .NET/C# de los ejemplos → templates utilizables en cualquier stack.
- Una sola fuente de las reglas de formato/delta/archivado (las skills); sin duplicación.
- Quitar el ruido de Engram (fuera de alcance) de los prompts.
- Preservar intacto el marcador de inyección de modelo y la semántica del flujo SDD.

**Non-Goals:**
- Cambiar la estructura de fases, la delegación entre agentes, o el frontmatter tool-specific (F30/F6).
- Mover archivos o renombrar agentes/skills/comandos.
- Tocar el CLI (`init/update/fallback/models`).

## Decisions

### D1 — De-sesgo: ejemplos neutros + deferencia a AGENTS.md
En `soia-explorer`, `soia-specifier`, `soia-designer` y la skill `soia-format`, reemplazar los ejemplos
concretos de .NET (`UsuarioController.cs`, `MediatR`, `FluentValidation`, `dotnet test`, `Startup.cs`) por
ejemplos **stack-neutrales**: rutas genéricas (`path/to/handler`), operaciones genéricas (crear/leer/
actualizar), y verbos de dominio sin framework. Donde haga falta convención concreta, instruir
explícitamente "seguí las convenciones de `AGENTS.md`".
- **Por qué neutros y no "sin ejemplos"**: un ejemplo neutro guía al LLM sobre el *formato* esperado sin
  imponer stack; quitarlos del todo deja la salida más impredecible. (Alternativa multi-stack descartada:
  alarga las plantillas y re-introduce sesgo a los stacks elegidos.)

### D2 — Dedupe: separar *reglas* (skill) de *orquestación* (agente/comando)
La **regla algorítmica** (cómo se aplican ADDED/MODIFIED/REMOVED, el formato GIVEN/WHEN/THEN, los pasos
del merge) vive **solo** en las skills `soia-format`/`soia-delta`/`soia-archive`. La **orquestación**
(cuándo archivar, pedir confirmación, actualizar `.status.yaml`, mover la carpeta) queda en el agente/
comando, que **carga la skill** para la parte algorítmica en vez de reescribirla.
- En `soia-orchestrator` (sección Archiving) y en el comando `soia-archive`: dejar la secuencia de
  orquestación + "Load skill `soia-archive`" y **quitar** los pasos de merge restated.
- En `soia-specifier`: mantener "Load skill `soia-format`/`soia-delta`" y no duplicar las reglas.
- **Por qué**: `init` copia las skills al proyecto, y OpenCode las carga por nombre (mecanismo ya usado
  por el specifier). Una sola fuente elimina el riesgo de desincronización.

### D3 — Engram: quitar TODA referencia
Eliminar **toda** referencia a Engram de los agentes (las secciones multi-paso "Engram Integration" y
cualquier mención suelta), **sin dejar ninguna línea opcional**. Coherente con
[ADR 0008](../../docs/decisions/0008-engram-fuera-de-alcance.md): `soia init` no detecta Engram, así que
los prompts no deben referenciar una capacidad inexistente. La visión de Engram se mantiene solo en
`docs/proposal.md`, no en los prompts operativos.

## Risks / Trade-offs

- **Romper el marcador de inyección de modelo** → Mitigación: no tocar la línea del marcador ni el
  frontmatter; `tests/templates.test.ts` corre en CI y debe pasar.
- **Sobre-editar y alterar la semántica del flujo SDD** (fases, delegación, protocolos de bloqueo) →
  Mitigación: el alcance se limita a ejemplos, reglas duplicadas y Engram; la lógica de fases no se toca.
- **Ejemplos demasiado vagos** tras quitar el stack → Mitigación: usar ejemplos neutros pero **concretos**
  (rutas y operaciones genéricas), no descripciones abstractas.
- **D2 cambia "copia inline redundante" por "dependencia de cargar la skill"**: al quitar la regla inline,
  el agente/comando depende de que la skill se cargue bien. Es el mecanismo nativo (ADR 0004) y el
  `soia-specifier` ya depende de ello, pero es un **cambio de comportamiento a confirmar en la corrida
  real (F32)**. Si el skill-loading resultara poco fiable, se revisa.
- **D2 no toca la fragilidad del merge por LLM** (concern #8): eso es F28 (mover el merge a código del
  CLI). D2 solo elimina la duplicación de la regla.

## Migration Plan

No aplica: es cambio de contenido de plantillas, sin migración de datos ni de comportamiento del CLI. El
`init` sigue copiando los mismos archivos. La validación end-to-end real del flujo es F32 (Fase 4).
