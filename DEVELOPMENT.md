# Desarrollo de Swarm-Orchest-IA

Guía técnica para **desarrollar la herramienta** (el CLI y las plantillas). Si solo querés *usar* el
producto, mirá el [README](README.md) y [docs/usage.md](docs/usage.md). Para el **flujo de
colaboración** (ramas, PRs, convenciones), ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Prerrequisitos

- **Node.js 20+** y npm.
- Git.

## Setup

```bash
git clone https://github.com/dsquintero/Swarm-Orchest-IA
cd Swarm-Orchest-IA
npm install          # instalar dependencias (desde la raíz)
npm run build        # compilar TS → dist/
```

## Comandos de desarrollo

```bash
npm run build            # Compilar TS → dist/
npm run dev -- <cmd>     # Ejecutar con ts-node sin compilar (ej: npm run dev -- init /tmp/test)
npm start -- <cmd>       # Ejecutar la versión compilada (node dist/cmd/soia.js)
npm test                 # Correr la suite de tests (Vitest)
npm run test:watch       # Tests en modo watch
npm run coverage         # Tests con reporte de cobertura
```

Probar el CLI sin compilar: `npm run dev -- init /ruta/a/un/proyecto/de/prueba`.

## Estructura del repositorio

Mapa completo en [AGENTS.md](AGENTS.md). En resumen:

- `src/` — código del CLI (`cmd/soia.ts` + `lib/`).
- `templates/opencode/` — plantillas **canónicas** que instala el CLI (editá acá).
- `tests/` — tests con Vitest.
- `docs/` — documentación (índice en [docs/README.md](docs/README.md)).
- `openspec/` — SDD de **este** repo (`/opsx:*`).

## Tests

Usamos **Vitest** (`tests/*.test.ts`). Toda lógica nueva debe venir con tests y la suite debe quedar
verde antes del merge. Estrategia y detalle en [docs/testing.md](docs/testing.md).

## Documentación técnica

| Necesitás… | Leé |
|---|---|
| Arquitectura del CLI | [docs/architecture.md](docs/architecture.md) |
| Stack y tecnologías | [docs/technologies.md](docs/technologies.md) |
| Plantillas e inyección de modelos | [docs/templates-system.md](docs/templates-system.md) |
| Configuración de modelos | [docs/models-config.md](docs/models-config.md) |
| **Por qué** se decidió algo (ADRs) | [docs/decisions/](docs/decisions/) |
| Estado y roadmap | [ROADMAP.md](ROADMAP.md) |

## Limitaciones conocidas

- **Resolución de HOME en Windows**: el código usa `process.env.HOME` con un fallback POSIX. En Windows
  nativo `HOME` suele no estar definido, por lo que la config global se resolvería a una ruta
  incorrecta. Debería usar `os.homedir()` (F1, prioridad alta — ver [ROADMAP.md](ROADMAP.md)).
- **Symlinks en modo global (en remoción)**: la implementación actual de `soia init -g` usa symlinks
  (`fs.symlinkSync`), que fallan en Windows sin Developer Mode. Se está eliminando: ambos modos pasan a
  render/copia a ruta nativa (ver [ADR 0013](docs/decisions/0013-canonical-source-adapters.md) y F2).
  Mientras tanto, en Windows usá el modo **local** (`-l`).
- **Plantillas default sin uso**: `templates/opencode/defaults/soia.yaml` y `soia-config.yaml`
  no los consume el CLI (se genera `config.yaml` inline). Limpiar o cablear (F5).

## Contribuir

El flujo (ramas GitFlow, convenciones, proceso de PR) está en [CONTRIBUTING.md](CONTRIBUTING.md).
