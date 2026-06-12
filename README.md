# Swarm-Orchest-IA

Orquestador multi-agente de SDD (Spec-Driven Development) para OpenCode. Liviano, portable y entendible.

## Qué hace

Swarm-Orchest-IA coordina un equipo de agentes especializados de IA para seguir un flujo de desarrollo
guiado por especificaciones:

```
exploring → spec-writing → design → implementing → verifying → archiving
```

Cada fase la ejecuta un agente distinto con el modelo óptimo para su tarea. El orquestador coordina las
transiciones y el usuario aprueba cada avance.

## Quickstart

```bash
npm install
npm run build

# Inicializar un proyecto (pregunta modo Global/symlinks o Local/copias)
node dist/cmd/swarm.js init /path/to/mi-proyecto
```

Guía de uso completa (comandos, validaciones, flujo SDD, agentes): **[docs/usage.md](docs/usage.md)**.

## Documentación

| Para… | Ver |
|---|---|
| **Usar** el CLI (comandos, flujo SDD, agentes) | [docs/usage.md](docs/usage.md) |
| Cómo está **construido** (arquitectura, módulos) | [docs/architecture.md](docs/architecture.md) |
| Stack y tecnologías | [docs/technologies.md](docs/technologies.md) |
| Sistema de plantillas e inyección de modelos | [docs/templates-system.md](docs/templates-system.md) |
| Configuración de modelos | [docs/models-config.md](docs/models-config.md) |
| Tests | [docs/testing.md](docs/testing.md) |
| **Por qué** se decidió algo (ADRs) | [docs/decisions/](docs/decisions/) |
| Glosario y conceptos | [docs/glossary.md](docs/glossary.md) |
| Visión de producto | [docs/proposal.md](docs/proposal.md) |
| Contribuir (flujo, convenciones) | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Estado y roadmap | [ROADMAP.md](ROADMAP.md) |

Índice completo: [docs/README.md](docs/README.md).

## Estado del proyecto

El mapa vivo de funcionalidades vive en **[ROADMAP.md](ROADMAP.md)**. En esta etapa el foco es que
**OpenCode funcione bien**; el soporte de más plataformas (Claude → Codex → más) y la integración con
Engram se abordan después.

## Limitaciones conocidas

- **Resolución de HOME en Windows**: el código usa `process.env.HOME || '/root'`. En Windows nativo
  `HOME` suele no estar definido, por lo que la config global se resolvería a una ruta incorrecta.
  Debería usar `os.homedir()`. (Prioridad alta — ver [ROADMAP.md](ROADMAP.md).)
- **Modo global en Windows sin Developer Mode**: `swarm init -g` crea symlinks con `fs.symlinkSync`,
  que falla sin privilegios. Workaround: usar el modo **local** (`-l`).
- **Plantillas default sin uso**: `templates/opencode/defaults/swarm.yaml` y `swarm-config.yaml`
  no los consume el CLI (se genera `config.yaml` inline). Limpiar o cablear.

## Licencia

MIT
