# Sistema de plantillas e inyección de modelos

> El **core del dominio**: cómo las plantillas de agentes reciben su `model:`/`temperature:` sin
> tenerlos hardcodeados. Si tocás `templates/opencode/agents/`, leé esto primero.

## Concepto central

Las plantillas de agentes **no** contienen `model:` ni `temperature:`. En su lugar llevan un
**comentario marcador** en el frontmatter:

```
# model y temperature se inyectan desde ~/.config/swarm/.agents-conf.yaml
```

Durante `swarm init`/`update`, [`lib/injector.ts`](../src/lib/injector.ts) reemplaza esa línea por
los valores del agente tomados de `.agents-conf.yaml`. Cambiar el modelo de todos los agentes es
editar una línea de config. Ver [models-config.md](models-config.md).

## Funciones del injector

| Función | Qué hace |
|---|---|
| `injectIntoAgent(content, agentName, config)` | Reemplaza el **marcador** por `model`/`temperature` del agente. No-op si el agente no está en config o si no hay marcador (idempotente: una vez consumido el marcador, no vuelve a actuar) |
| `injectInto(content, model, temperature)` | Reemplaza el marcador **o** un `model:` existente; usada por `update`/`fallback` para re-inyectar (idempotente) |
| `isSwarmAgent(filename)` | `true` para `swarm-*.md` |
| `needsInjection(content)` | `true` si el marcador está presente |

## Plantillas canónicas

- **Editá** `templates/opencode/` — es la copia **canónica** que instala el CLI.

Contenido (`templates/opencode/`):

```
agents/     ← 6 agentes swarm-* (con marcador, sin modelo hardcodeado)
skills/     ← swarm-format, swarm-delta, swarm-archive
commands/   ← swarm-propose, swarm-apply, swarm-verify, swarm-archive
defaults/   ← .agents-conf.yaml, AGENTS.md, opencode.json, current.yaml,
              local-agents-conf.yaml, swarm.yaml, swarm-config.yaml, spec de ejemplo
```

> Nota: `defaults/swarm.yaml` y `defaults/swarm-config.yaml` hoy **no** los consume el CLI
> (`init` genera `config.yaml` inline). Ver F5 en [ROADMAP.md](../ROADMAP.md).

## Qué genera `swarm init` en el proyecto destino

```
.opencode/{agents,skills,commands}   ← symlinks (global) o copias (local)
AGENTS.md                            ← generado con el nombre del proyecto
opencode.json
swarmspec/{specs,changes/archive}    ← con un spec de ejemplo
.swarm/{config.yaml,current.yaml,.agents-conf.yaml}
```

## Garantía por tests

[`tests/templates.test.ts`](../tests/templates.test.ts) verifica que los 6 agentes mantengan el
marcador y no tengan `model:` hardcodeado, y que sean inyectables. **Si cambiás el texto del marcador,
actualizá también la constante `INJECT_COMMENT` en `injector.ts` y este test** — si no, la inyección
falla en silencio.
