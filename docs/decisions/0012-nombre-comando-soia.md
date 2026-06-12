# ADR 0012 — `soia` como nombre corto (comando + producto)

- **Estado**: Aceptada (implementada en F19)
- **Fecha**: 2026-06-11 (ampliada 2026-06-12: `soia` es el nombre corto **universal**, no solo el comando)

## Contexto

El producto final es un CLI que se instala con `npm install -g`. El nombre corto inicial era **`swarm`**
(comando, prefijo de agentes `swarm-*`, carpetas `.swarm/` y `swarmspec/`). Se quería un nombre corto
**propio, memorable y consistente** en todo el ecosistema, sin perder la marca.

## Decisión

**`soia`** (iniciales de **S**warm-**O**rchest-**IA**) es el **nombre corto universal** del proyecto.
Reemplaza a `swarm` en:

- **Comando CLI**: `soia init/update/fallback/models`.
- **Prefijo del producto**: agentes `soia-*`, skills `soia-*`, comandos `/soia-*`.
- **Carpetas y config**: internals `.soia/`, specs `soia-spec/`, config global `~/.config/soia/`.

**Se mantiene** (no es el nombre corto):
- El **nombre completo de la marca**: **Swarm-Orchest-IA** (de donde `soia` es el diminutivo).
- El **paquete npm**: `swarm-orchest-ia` (kebab del nombre completo; `soia` está ocupado en npm).

```
npm install -g swarm-orchest-ia
soia init
```

## Consecuencias

- Rename completo aplicado (F19): código, plantillas, contratos (`.soia/config.yaml`, prefijo `soia-`,
  marcador de inyección), tests y docs. Marca y paquete intactos.
- Se hizo **antes** de la primera publicación en npm (F11) para no romper a usuarios.

## Alternativas consideradas

- **Mantener `swarm`**: genérico y menos distintivo. Descartado.
- **`swarmo` / `sorch` / `orchia`** (comando): brandables, pero se priorizó un nombre de 3-4 letras.
- **`swo` / `sia` / `orc`**: descartados frente a `soia` por claridad y relación con la marca.
