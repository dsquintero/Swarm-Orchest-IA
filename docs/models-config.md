# Configuración de modelos

> Cómo se asignan los modelos a cada agente. La inyección en las plantillas se documenta en
> [templates-system.md](templates-system.md).

## Fuente de verdad: `.agents-conf.yaml`

Un único archivo configura los modelos de todos los agentes, con `primary`, `fallback` y
`temperature`. `soia init` los inyecta en cada agente.

- **Global**: `~/.config/soia/.agents-conf.yaml` — compartido por todos los proyectos.
- **Override local**: `<proyecto>/.soia/.agents-conf.yaml` — solo las claves que cambian.

`agentsconf.merge(global, local)` combina: el local **pisa** las claves definidas y hereda el resto.

```yaml
soia-orchestrator:
  primary: opencode-go/deepseek-v4-pro
  fallback: opencode-go/kimi-k2.6
  temperature: 0.3
soia-explorer:
  primary: opencode-go/deepseek-v4-flash
  fallback: opencode-go/minimax-m2.7
  temperature: 0.1
# ...
```

> `opencode-go` es el **proveedor de modelos** (suscripción OpenCode Go), no el lenguaje del CLI.

## Asignación por costo

| Agente | Modelo primario | Perfil |
|---|---|---|
| explorer | DeepSeek V4 **Flash** | Barato — solo lectura |
| orchestrator | DeepSeek V4 **Pro** | Medio — coordina |
| implementer | DeepSeek V4 **Pro** | Medio — escribe código |
| specifier | **GLM-5** | Caro — specs formales |
| designer | **GLM-5.1** | Más caro — arquitectura |
| verifier | **GLM-5** | Caro — validación |

Los modelos caros (GLM) solo se usan en 3 de las 6 fases y se ejecutan pocas veces por feature.

## Portabilidad entre herramientas (decisión abierta de F6)

Hoy los valores de `model` están en el formato que espera **OpenCode** (`provider/model-id`, ej.
`opencode-go/deepseek-v4-pro`) y se asume `temperature` siempre presente. Al sumar el adapter de Claude
([ADR 0013](decisions/0013-canonical-source-adapters.md)) aparecen dos límites confirmados en la doc de
cada tool:

- **`temperature` no es universal**: Claude Code no soporta el campo (usa `effort`). El render de Claude
  inyecta solo `model`.
- **El `model` no es portable**: Claude espera alias / id pelado / `inherit`, no `provider/model-id`.

Queda **abierto para F6** cómo modelar esto: una **forma neutra + tabla de mapeo por adapter**, o
**valores de modelo por-tool** dentro de `.agents-conf.yaml`. Se decide al implementar el motor de
adapters; por ahora solo OpenCode consume estos valores tal cual.

## Comandos relacionados

- `soia models [--primary|--fallback]` — muestra la config efectiva (global + override local).
- `soia fallback <agente>|--all|--restore` — escribe un override local intercambiando
  `primary`↔`fallback` y re-inyecta. `--restore` elimina el override local.
- `soia update` — re-inyecta los modelos si cambió `.agents-conf.yaml`.
