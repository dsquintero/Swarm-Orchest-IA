# Documentación — Swarm-Orchest-IA

Índice de la documentación del repo. `AGENTS.md` (en la raíz) es el router liviano que cargan los
agentes de IA; **el detalle vive acá** y se lee según se necesite.

## Mapa

| Doc | Leé esto cuando necesités… |
|---|---|
| [usage.md](usage.md) | Usar el CLI: comandos, flujo SDD, agentes, estructura del proyecto |
| [proposal.md](proposal.md) | La visión de producto y diseño original |
| [architecture.md](architecture.md) | Entender cómo está armado el CLI: módulos, flujo, contratos de paths |
| [technologies.md](technologies.md) | Saber qué librería se usa y por qué; tooling de build/test |
| [templates-system.md](templates-system.md) | Tocar plantillas, el marcador de inyección, o entender qué genera `swarm init` |
| [models-config.md](models-config.md) | Cambiar modelos, entender primary/fallback y la config `.agents-conf.yaml` |
| [testing.md](testing.md) | Escribir o entender los tests |
| [glossary.md](glossary.md) | Aclarar términos y conceptos (los dos planos, adapters, etc.) |
| [decisions/](decisions/) | Saber **por qué** se tomó una decisión (ADRs) |

## Documentación relacionada (raíz del repo)

- [ROADMAP.md](../ROADMAP.md) — mapa vivo de funcionalidades y estado.
- [CONTRIBUTING.md](../CONTRIBUTING.md) — flujo de colaboración y convenciones.
- [AGENTS.md](../AGENTS.md) — contexto canónico para agentes (router).

## Mantenimiento

La documentación se mantiene **bajo confirmación del usuario**. Si un cambio deja un doc
desactualizado, el contribuyente (persona o agente) debe **avisarlo** y proponer el ajuste. Las
decisiones de arquitectura/alcance se registran como **ADRs** en [decisions/](decisions/).
