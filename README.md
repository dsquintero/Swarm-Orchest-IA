# Swarm-Orchest-IA

Orquestador multi-agente de SDD (Spec-Driven Development) para OpenCode. Liviano, portable, y entendible.

## Que hace

Swarm-Orchest-IA coordina un equipo de agentes especializados de AI para seguir un flujo de desarrollo guiado por especificaciones:

```
exploring → spec-writing → design → implementing → verifying → archiving
```

Cada fase la ejecuta un agente distinto con el modelo optimo para su tarea. El orquestador coordina las transiciones y el usuario aprueba cada avance.

## Instalar

```bash
cd swarm-cli
npm install
npm run build
```

## Uso

### Inicializar un proyecto

```bash
cd mi-proyecto

# Con el binario compilado
node /path/to/swarm-cli/dist/cmd/swarm.js init --tool opencode

# Con ts-node (desarrollo)
npm run dev -- init --tool opencode
```

El comando pregunta si queres instalacion **Global** (symlinks) o **Local** (copias):

- **Global**: los agentes, skills y comandos se linkean a `~/.config/swarm/templates/opencode/`. Cambios en las plantillas se propagan a todos los proyectos con `swarm update`.
- **Local**: todo se copia al proyecto. Cada proyecto es independiente. Ideal para commitear al repo.

### Comandos disponibles

```bash
swarm init --tool opencode    # Inicializar el proyecto
swarm update                  # Actualizar modelos y plantillas
swarm update --all            # Actualizar todos los proyectos
swarm fallback --all          # Cambiar todos los agentes a modelos fallback
swarm fallback swarm-explorer # Cambiar un agente a su fallback
swarm fallback --restore      # Restaurar modelos primarios
swarm models                  # Ver configuracion de modelos
swarm models --primary        # Solo modelos primarios
swarm models --fallback       # Solo modelos fallback
```

### Estructura del proyecto inicializado

```
mi-proyecto/
├── .swarm.yaml                    ← modo (global/local) y ruta a templates
├── .opencode/
│   ├── agents/                    ← 6 agentes (symlinks o copias)
│   ├── skills/                    ← 3 skills
│   └── commands/                  ← 4 comandos
├── AGENTS.md                      ← reglas del proyecto (auto-generado)
├── opencode.json                  ← configuracion OpenCode
├── swarmspec/
│   ├── specs/                     ← fuente de verdad
│   │   └── hello-mundo/spec.md   ← spec de ejemplo
│   └── changes/archive/           ← cambios archivados
└── .swarm/
    ├── config.yaml                ← tool, modo, fecha
    ├── current.yaml               ← change activo (null al inicio)
    └── .agents-conf.yaml          ← override local de modelos
```

## Flujo SDD

1. **`/swarm-propose "crud de usuarios"`** — El orquestador crea la estructura del change e inicia la exploracion
2. **Exploring** — `@swarm-explorer` analiza el codebase y escribe `exploration.md`
3. **Spec-writing** — `@swarm-specifier` escribe `proposal.md` + delta specs (GIVEN/WHEN/THEN)
4. **Design** — `@swarm-designer` escribe `design.md` con decisiones ADR
5. **Implementing** — `@swarm-implementer` escribe codigo siguiendo specs + design + tasks
6. **Verifying** — `@swarm-verifier` valida implementacion contra specs
7. **Archiving** — el orquestador mergea deltas a specs y archiva el change

El usuario aprueba en cada transicion.

## Agentes

| Agente | Modelo primario | Funcion |
|--------|----------------|---------|
| swarm-orchestrator | DeepSeek V4 Pro | Coordina el flujo SDD, delega a sub-agentes |
| swarm-explorer | DeepSeek V4 Flash | Lee el codebase, detecta patrones y riesgos |
| swarm-specifier | GLM-5 | Escribe specs formales (GIVEN/WHEN/THEN) |
| swarm-designer | GLM-5.1 | Toma decisiones de arquitectura (ADR) |
| swarm-implementer | DeepSeek V4 Pro | Escribe codigo siguiendo specs y design |
| swarm-verifier | GLM-5 | Valida implementacion contra specs |

## Configuracion de modelos

Los modelos se configuran en `~/.config/swarm/.agents-conf.yaml`:

```yaml
swarm-orchestrator:
  primary: opencode-go/deepseek-v4-pro
  fallback: opencode-go/kimi-k2.6
  temperature: 0.3

swarm-explorer:
  primary: opencode-go/deepseek-v4-flash
  fallback: opencode-go/minimax-m2.7
  temperature: 0.1
# ... etc
```

Override por proyecto en `.swarm/.agents-conf.yaml`:

```yaml
swarm-implementer:
  primary: opencode-go/kimi-k2.6
```

## Estructura del repositorio

```
Swarm-Orchest-IA/
├── docs/                              ← Documentacion y referencia
│   ├── PROPOSAL.md                    ← Diseno completo del proyecto
│   └── _prototype/                    ← Plantillas originales (referencia)
│       ├── defaults/                  ← 8 archivos de defaults
│       └── templates/opencode/       ← 13 archivos agentes/skills/commands
│
├── swarm-cli/                         ← CLI TypeScript/Node.js
│   ├── src/
│   │   ├── cmd/swarm.ts              ← Entry point (commander)
│   │   └── lib/                       ← Logica: agentsconf, injector, init, update, fallback, models
│   ├── templates/opencode/            ← Plantillas canonicas (21 archivos)
│   │   ├── agents/                    ← 6 agentes refinados
│   │   ├── commands/                  ← 4 comandos
│   │   ├── skills/                    ← 3 skills
│   │   └── defaults/                 ← defaults + spec de ejemplo
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Comandos de desarrollo

```bash
cd swarm-cli

npm install             # Instalar dependencias
npm run build          # Compilar TypeScript a dist/
npm run dev -- <cmd>   # Ejecutar con ts-node (sin compilar)
npm start -- <cmd>     # Ejecutar version compilada
```

## Stack

- **CLI**: TypeScript + Node.js + Commander.js + js-yaml
- **Agentes**: OpenCode nativo (agentes, skills, comandos)
- **Formato de specs**: OpenSpec (GIVEN/WHEN/THEN, SHALL/MUST, deltas ADDED/MODIFIED/REMOVED)
- **Modelos**: OpenCode Go (DeepSeek V4 Pro/Flash, GLM-5/5.1, Kimi K2.6, MiniMax M2.7)
- **Memoria**: Engram (opcional)

## Licencia

MIT