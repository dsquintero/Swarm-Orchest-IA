# ADR 0014 — Configuración neutra: modelo por tool y esfuerzo (mapeo por adapter)

- **Estado**: Propuesta
- **Fecha**: 2026-06-12
- **Relacionada**: [ADR 0013](0013-canonical-source-adapters.md) (adapters), [ADR 0003](0003-modelos-en-agents-conf.md)
  (modelos en `.agents-conf.yaml`), [ADR 0009](0009-multiplataforma-seleccion-multiple.md) (multi-tool).

## Contexto

Al aterrizar el diseño de adapters contra la documentación oficial ([ADR 0013](0013-canonical-source-adapters.md))
se confirmaron dos límites que rompen la portabilidad de `.agents-conf.yaml` entre herramientas:

1. **`temperature` no es portable.** OpenCode la soporta (rango 0–1, por agente); **Claude Code no la
   tiene** — usa `effort` (`low|medium|high|xhigh|max`), que controla el *razonamiento adaptativo*.
2. **El id de `model` no es portable.** OpenCode espera `provider/model-id` (ej. `opencode-go/glm-5`);
   Claude espera alias / id pelado / `inherit` (ej. `opus`, `claude-opus-4-8`).

El `.agents-conf.yaml` actual guarda `model` en formato OpenCode y una `temperature` numérica plana —
**ninguno de los dos sobrevive** al render del adapter de Claude. La inyección hoy es global
(`injector.ts` mete `model` + `temperature` igual para todos), lo que tampoco encaja con el modelo de
adapters.

## Decisión

### 1. El esfuerzo (`effort`) es el concepto canónico — y NO se deriva de `temperature`

`.agents-conf.yaml` adopta **`effort`** como el knob humano por agente: `low | medium | high | xhigh |
max`. Mide **profundidad de razonamiento** (cuánto piensa el modelo antes de responder), **no**
aleatoriedad. Cada adapter lo mapea a su equivalente **nativo de razonamiento**:

- **Claude** → `effort` nativo (1:1).
- **OpenCode** → `reasoningEffort` (OpenAI) / `thinking` (Anthropic) **donde el modelo lo soporte**; si
  el modelo no tiene razonamiento, es no-op.

**`temperature` es un eje distinto** (aleatoriedad del sampling, rango 0–1) y **no tiene equivalente en
Claude**. Por eso **no se deriva de `effort`**: se trata como un override **opcional y exclusivo de
OpenCode**, por agente. Si no se setea, OpenCode usa el default del modelo.

> ⚠️ Una versión anterior de esta ADR mapeaba `effort`→`temperature` con una tabla **inversa** (más
> esfuerzo = menos temperatura). Era **conceptualmente incorrecto**: confundía *profundidad de
> razonamiento* con *aleatoriedad*, que son ejes independientes. Se descarta. Cada uno se mapea a su
> equivalente real; `temperature` no se calcula a partir de `effort`.

### 2. El modelo se guarda explícito por herramienta

`model` y `fallback` se almacenan **por tool** en `.agents-conf.yaml`, porque los ids son
provider-specific y **volátiles** (cambian seguido):

```yaml
soia-specifier:
  effort: high                    # razonamiento (Claude effort / OpenCode reasoningEffort)
  model:
    opencode: opencode-go/glm-5
    claude: opus
  fallback:
    opencode: opencode-go/glm-5-air
    claude: sonnet
  temperature:                    # OPCIONAL, solo OpenCode (Claude lo ignora)
    opencode: 0.1
```

El adapter resuelve `model[toolId]`. Si falta el valor para una tool, error claro (o, en Claude,
fallback a `inherit`). El bloque `temperature` es opcional; si no está, OpenCode usa el default del
modelo y Claude no lo usa nunca.

**Alternativa descartada**: *tiers neutros* (`cheap`/`balanced`/`premium`) + tabla tier→model por tool.
Más elegante y simétrica con `effort`, pero **frágil**: cada renombre o alta de modelo rompería la tabla.
El `effort` sí justifica el enum neutro (taxonomía estable); el `model` no (valores volátiles).

### 3. La config existe en dos niveles (global y local) y se mergea

El schema nuevo **respeta el merge global/local existente** ([ADR 0003](0003-modelos-en-agents-conf.md)):

- **Global** — `~/.config/soia/.agents-conf.yaml`: la base, compartida por todos los proyectos del usuario.
- **Local** — `<proyecto>/.soia/.agents-conf.yaml`: override del proyecto, **solo las claves que cambian**.

El merge es **por clave hasta el nivel de agente/tool**: un proyecto puede overridear, por ejemplo, solo
`soia-specifier.model.claude` o `soia-explorer.effort` sin redefinir el resto. `agentsconf.merge(global,
local)` se extiende para el schema anidado (`model`/`fallback` por tool, `effort`, `temperature`).

Para los **settings** (`config.yaml`: `tool`/`mode`/`language`/`version`) el proyecto manda;
opcionalmente un archivo **global de defaults** puede sugerir `language`/`tool` para no reconfigurar en
cada `init` (a definir en **F29**).

> El **estado runtime** (qué cambio está activo) **no es config** y queda fuera de esta ADR. El puntero
> único `current.yaml` se **elimina** (**F27**) a favor de `--change <nombre>` explícito; el estado vive
> por cambio en `.status.yaml`. Así la herramienta soporta múltiples instancias/cambios en paralelo.

## Consecuencias

- **Cambia el schema de `.agents-conf.yaml`** (global y local) → toca `agentsconf.ts`, `injector.ts`,
  `models.ts`, `fallback.ts` y los defaults. Se coordina con **F6** (motor) y **F29** (estandarización
  de config).
- La **inyección pasa a ser por adapter** (no global): cada adapter decide qué campos pone y en qué
  formato — coherente con [ADR 0013](0013-canonical-source-adapters.md).
- `soia models` / `soia fallback` muestran e intercambian valores **por tool**.
- **Migración**: los `.agents-conf.yaml` con el schema viejo (`temperature` plana, `model` plano)
  necesitan migración o un mensaje de validación claro (**F12**).
- `config.yaml` suma `language` (**F25**) y `version` de schema (**F29**) — no es parte de esta ADR pero
  comparte el momento de estandarización.

## Notas de estado

- El uso de **`effort` como concepto canónico** está **decidido** por el equipo (términos humanos,
  nativo en Claude).
- El **almacenamiento de `model` por tool** es la opción recomendada en esta propuesta; se confirma al
  aceptar la ADR.
