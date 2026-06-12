# Guía de uso del CLI

> Cómo usar el CLI para preparar un proyecto y correr el flujo SDD. Para la config de modelos
> en detalle ver [models-config.md](models-config.md); para la arquitectura interna,
> [architecture.md](architecture.md).

## Prerrequisitos

El CLI solo **prepara la estructura** del proyecto; el ecosistema necesita además:

- **Node.js 20+** (para correr el CLI).
- **OpenCode** instalado (es quien ejecuta los agentes del flujo SDD).
- **Un proveedor de modelos** configurado (por defecto `opencode-go`); ver [models-config.md](models-config.md).

> La publicación en npm (`npm install -g swarm-orchest-ia`) está pendiente (F11). Por ahora se instala
> desde el código (ver abajo).

## Instalación

```bash
npm install
npm run build
```

## Inicializar un proyecto

```bash
# En el directorio del proyecto
cd mi-proyecto
node /path/to/swarm-orchest-ia/dist/cmd/soia.js init

# Especificando ruta al proyecto
node /path/to/swarm-orchest-ia/dist/cmd/soia.js init /path/to/mi-proyecto

# Con ts-node (desarrollo)
npm run dev -- init
```

El comando pregunta si querés instalación **Global** o **Local**. En ambos casos los agentes, skills y
comandos se **renderizan al formato nativo de la herramienta** (sin symlinks):

- **Global**: se escriben en la ruta **global de la herramienta** (ej. `~/.config/opencode/…`), así
  quedan disponibles en todos tus proyectos de esa tool. `soia update` re-renderiza.
- **Local**: se copian dentro del **proyecto** (`.opencode/…`). Autocontenido, ideal para commitear al repo.

> Funciona en Windows sin trucos (no se usan symlinks). Ver
> [ADR 0013](decisions/0013-canonical-source-adapters.md).

## Argumento `[path]`

Todos los comandos aceptan un `[path]` opcional (directorio del proyecto). Sin él, usan el directorio
actual.

```bash
soia init [path]                                  # Por defecto: directorio actual
soia update [path]                                # Actualizar un proyecto específico
soia update --all                                 # Actualizar todos los proyectos
soia fallback [agent-name] --path /otro/proyecto  # Con ruta explícita
soia models [path]                                # Ver config de modelos
```

Validaciones:
- `[path]` no existe → `"Directory does not exist: <path>"`
- `[path]` no es un directorio → `"Not a directory: <path>"`
- `soia init` en un proyecto ya inicializado → `"Project already initialized"`
- `soia update/fallback/models` sin `.soia/config.yaml` → `"Not a Soia project"`

## Comandos disponibles

```bash
soia init [path] --tool opencode   # Inicializar proyecto
soia update [path]                 # Actualizar modelos y plantillas
soia update --all                  # Actualizar todos los proyectos
soia fallback [agent-name]         # Cambiar un agente a su fallback
soia fallback --all                # Cambiar todos los agentes a fallback
soia fallback --restore            # Restaurar modelos primarios
soia models [path]                 # Ver configuración de modelos
soia models --primary              # Solo modelos primarios
soia models --fallback             # Solo modelos fallback
```

## Estructura del proyecto inicializado

```
mi-proyecto/
├── .opencode/
│   ├── agents/                    ← 6 agentes (render/copia; modo local)
│   ├── skills/                    ← 3 skills
│   └── commands/                  ← 4 comandos
├── AGENTS.md                      ← reglas del proyecto (auto-generado)
├── opencode.json                  ← configuración OpenCode
├── soia-spec/
│   ├── specs/                     ← fuente de verdad
│   │   └── hello-mundo/spec.md   ← spec de ejemplo
│   └── changes/archive/           ← cambios archivados
└── .soia/
    ├── config.yaml                ← tool, modo, templates_path, initialized_at
    ├── current.yaml               ← change activo (null al inicio)
    └── .agents-conf.yaml          ← override local de modelos
```

## Flujo SDD (en el proyecto del usuario)

1. **`/soia-propose "crud de usuarios"`** — el orquestador crea la estructura del change e inicia la exploración.
2. **Exploring** — `@soia-explorer` analiza el codebase y escribe `exploration.md`.
3. **Spec-writing** — `@soia-specifier` escribe `proposal.md` + delta specs (GIVEN/WHEN/THEN).
4. **Design** — `@soia-designer` escribe `design.md` con decisiones ADR.
5. **Implementing** — `@soia-implementer` escribe código siguiendo specs + design + tasks.
6. **Verifying** — `@soia-verifier` valida la implementación contra las specs.
7. **Archiving** — el orquestador mergea deltas a specs y archiva el change.

El usuario aprueba en cada transición.

## Agentes

| Agente | Modelo primario | Función |
|--------|----------------|---------|
| soia-orchestrator | DeepSeek V4 Pro | Coordina el flujo SDD, delega a sub-agentes |
| soia-explorer | DeepSeek V4 Flash | Lee el codebase, detecta patrones y riesgos |
| soia-specifier | GLM-5 | Escribe specs formales (GIVEN/WHEN/THEN) |
| soia-designer | GLM-5.1 | Toma decisiones de arquitectura (ADR) |
| soia-implementer | DeepSeek V4 Pro | Escribe código siguiendo specs y design |
| soia-verifier | GLM-5 | Valida implementación contra specs |

## Configuración de modelos

Los modelos se configuran en `~/.config/soia/.agents-conf.yaml` (global) con override por proyecto en
`.soia/.agents-conf.yaml`. Ver el detalle, la asignación por costo y los comandos relacionados en
[models-config.md](models-config.md).
