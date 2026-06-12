# ADR 0014 — Configuración de modelos por tool

- **Estado**: Aceptada
- **Fecha**: 2026-06-12
- **Relacionada**: [ADR 0013](0013-canonical-source-adapters.md) (adapters), [ADR 0003](0003-modelos-en-agents-conf.md)
  (modelos en `.agents-conf.yaml`), [ADR 0009](0009-multiplataforma-seleccion-multiple.md) (multi-tool).

> **Alcance.** Esta ADR decide **cómo se guarda y resuelve el modelo de cada agente por herramienta**.
> El eje de **esfuerzo/razonamiento** (`effort` en Claude, `reasoningEffort`/`thinking`/`temperature` en
> OpenCode) queda **fuera de alcance y diferido**: se decide al construir el adapter de Claude (**F7**) y
> se calibra empíricamente en la corrida de validación (**F32**). Hasta entonces, `temperature` se
> mantiene como está hoy (plana, OpenCode-only).

## Contexto

Al aterrizar el diseño de adapters contra la documentación oficial ([ADR 0013](0013-canonical-source-adapters.md))
se confirmó que **el id de `model` no es portable entre herramientas**: OpenCode espera
`provider/model-id` (ej. `opencode-go/glm-5`); Claude espera alias / id pelado / `inherit`
(ej. `opus`, `claude-opus-4-8`). El `.agents-conf.yaml` actual guarda un `model` plano en formato
OpenCode que **no sobrevive** al render del adapter de Claude.

## Decisión

### 1. El modelo se guarda explícito por herramienta

`model` y `fallback` se almacenan **por tool** en `.agents-conf.yaml`, porque los ids son
provider-specific y **volátiles** (cambian seguido):

```yaml
soia-specifier:
  model:
    opencode: opencode-go/glm-5
    claude: opus
  fallback:
    opencode: opencode-go/glm-5-air
    claude: sonnet
```

El adapter resuelve `model[toolId]` al renderizar.

**Alternativa descartada**: *tiers neutros* (`cheap`/`balanced`/`premium`) + tabla tier→model por tool.
Más elegante, pero **frágil**: cada renombre o alta de modelo rompería la tabla. Los ids de modelo son
valores volátiles; no justifican una taxonomía neutra.

### 2. Regla de modelo faltante: error claro

Si para una tool elegida un agente **no tiene** `model.<tool>`, el render **falla con un error claro**
(ej. `falta model.opencode para soia-explorer`) en lugar de degradar en silencio. Razón: el valor
central de soia es **un modelo por agente según costo**; un modelo faltante es un **error de
configuración**, no algo a inferir silenciosamente (que podría disparar costo inesperado).

En la práctica el error casi no aparece porque soia **shippea defaults** para los 6 agentes en cada tool
soportada; la configuración guiada (**F33**) previene los faltantes de entrada.

### 3. La config existe en dos niveles (global y local) y se mergea

El schema **respeta el merge global/local existente** ([ADR 0003](0003-modelos-en-agents-conf.md)):

- **Global** — `~/.config/soia/.agents-conf.yaml`: la base, compartida por todos los proyectos del usuario.
- **Local** — `<proyecto>/.soia/.agents-conf.yaml`: override del proyecto, **solo las claves que cambian**.

El merge es **por clave hasta el nivel de agente/tool**: un proyecto puede overridear, por ejemplo, solo
`soia-specifier.model.claude` sin redefinir el resto. `agentsconf.merge(global, local)` se extiende para
el schema anidado (`model`/`fallback` por tool).

## Consecuencias

- **Cambia el schema de `model`/`fallback`** en `.agents-conf.yaml` (global y local) → toca
  `agentsconf.ts`, `injector.ts`, `models.ts`, `fallback.ts` y los defaults. Se coordina con **F6**
  (motor) y **F29** (estandarización de config).
- La **inyección/render del modelo pasa a ser por adapter** (no global): cada adapter resuelve
  `model[toolId]` — coherente con [ADR 0013](0013-canonical-source-adapters.md).
- `soia models` / `soia fallback` muestran e intercambian valores **por tool** (**F31**).
- La **configuración guiada** (**F33**) puebla este schema sin typos: validar existencia · per-agent vs
  uno-para-todos · picker de modelos por tool.
- **Migración**: los `.agents-conf.yaml` con `model` plano necesitan migración o un mensaje de
  validación claro (**F12**).
- **Diferido**: el eje de esfuerzo/razonamiento (`effort`/`temperature`) **no** se toca acá; `temperature`
  sigue como está (plana, OpenCode-only) hasta que se decida en **F7** y se valide en **F32**.
