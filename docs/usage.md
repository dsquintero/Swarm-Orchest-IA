# Guía de uso del CLI

> Cómo usar el CLI para preparar un proyecto y correr el flujo SDD. Para la config de modelos
> en detalle ver [models-config.md](models-config.md); para la arquitectura interna,
> [architecture.md](architecture.md).
>
> ℹ️ El comando del CLI será **`soia`** (ver [ADR 0012](decisions/0012-nombre-comando-soia.md)); el
> rename está pendiente (F19), por eso los ejemplos de abajo todavía usan `swarm`.

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
node /path/to/swarm-orchest-ia/dist/cmd/swarm.js init

# Especificando ruta al proyecto
node /path/to/swarm-orchest-ia/dist/cmd/swarm.js init /path/to/mi-proyecto

# Con ts-node (desarrollo)
npm run dev -- init
```

El comando pregunta si querés instalación **Global** o **Local**. En ambos casos los agentes, skills y
comandos se **renderizan al formato nativo de la herramienta** (sin symlinks):

- **Global**: se escriben en la ruta **global de la herramienta** (ej. `~/.config/opencode/…`), así
  quedan disponibles en todos tus proyectos de esa tool. `swarm update` re-renderiza.
- **Local**: se copian dentro del **proyecto** (`.opencode/…`). Autocontenido, ideal para commitear al repo.

> Funciona en Windows sin trucos (no se usan symlinks). Ver
> [ADR 0013](decisions/0013-canonical-source-adapters.md).

## Argumento `[path]`

Todos los comandos aceptan un `[path]` opcional (directorio del proyecto). Sin él, usan el directorio
actual.

```bash
swarm init [path]                                  # Por defecto: directorio actual
swarm update [path]                                # Actualizar un proyecto específico
swarm update --all                                 # Actualizar todos los proyectos
swarm fallback [agent-name] --path /otro/proyecto  # Con ruta explícita
swarm models [path]                                # Ver config de modelos
```

Validaciones:
- `[path]` no existe → `"Directory does not exist: <path>"`
- `[path]` no es un directorio → `"Not a directory: <path>"`
- `swarm init` en un proyecto ya inicializado → `"Project already initialized"`
- `swarm update/fallback/models` sin `.swarm/config.yaml` → `"Not a Swarm project"`

## Comandos disponibles

```bash
swarm init [path] --tool opencode   # Inicializar proyecto
swarm update [path]                 # Actualizar modelos y plantillas
swarm update --all                  # Actualizar todos los proyectos
swarm fallback [agent-name]         # Cambiar un agente a su fallback
swarm fallback --all                # Cambiar todos los agentes a fallback
swarm fallback --restore            # Restaurar modelos primarios
swarm models [path]                 # Ver configuración de modelos
swarm models --primary              # Solo modelos primarios
swarm models --fallback             # Solo modelos fallback
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
├── swarmspec/
│   ├── specs/                     ← fuente de verdad
│   │   └── hello-mundo/spec.md   ← spec de ejemplo
│   └── changes/archive/           ← cambios archivados
└── .swarm/
    ├── config.yaml                ← tool, modo, templates_path, initialized_at
    ├── current.yaml               ← change activo (null al inicio)
    └── .agents-conf.yaml          ← override local de modelos
```

## Flujo SDD (en el proyecto del usuario)

1. **`/swarm-propose "crud de usuarios"`** — el orquestador crea la estructura del change e inicia la exploración.
2. **Exploring** — `@swarm-explorer` analiza el codebase y escribe `exploration.md`.
3. **Spec-writing** — `@swarm-specifier` escribe `proposal.md` + delta specs (GIVEN/WHEN/THEN).
4. **Design** — `@swarm-designer` escribe `design.md` con decisiones ADR.
5. **Implementing** — `@swarm-implementer` escribe código siguiendo specs + design + tasks.
6. **Verifying** — `@swarm-verifier` valida la implementación contra las specs.
7. **Archiving** — el orquestador mergea deltas a specs y archiva el change.

El usuario aprueba en cada transición.

## Agentes

| Agente | Modelo primario | Función |
|--------|----------------|---------|
| swarm-orchestrator | DeepSeek V4 Pro | Coordina el flujo SDD, delega a sub-agentes |
| swarm-explorer | DeepSeek V4 Flash | Lee el codebase, detecta patrones y riesgos |
| swarm-specifier | GLM-5 | Escribe specs formales (GIVEN/WHEN/THEN) |
| swarm-designer | GLM-5.1 | Toma decisiones de arquitectura (ADR) |
| swarm-implementer | DeepSeek V4 Pro | Escribe código siguiendo specs y design |
| swarm-verifier | GLM-5 | Valida implementación contra specs |

## Configuración de modelos

Los modelos se configuran en `~/.config/swarm/.agents-conf.yaml` (global) con override por proyecto en
`.swarm/.agents-conf.yaml`. Ver el detalle, la asignación por costo y los comandos relacionados en
[models-config.md](models-config.md).
