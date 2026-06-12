# ADR 0012 — Comando `soia`, paquete `swarm-orchest-ia`

- **Estado**: Aceptada (implementación pendiente, ver F19 en el ROADMAP)
- **Fecha**: 2026-06-11

## Contexto

El producto final es un CLI que se instala con `npm install -g`. El comando inicial era `swarm`, que
es genérico y poco distintivo. Se buscó un comando **corto (3-4 letras), fácil de teclear y memorable**
para el usuario final, sin perder relación con la marca.

## Decisión

- **Comando**: `soia` — iniciales de **S**warm-**O**rchest-**IA**. Corto, único y atado a la marca.
- **Paquete npm**: se mantiene `swarm-orchest-ia` (descriptivo y bueno para descubrimiento; ya libre
  en npm). El usuario lo escribe una sola vez: `npm install -g swarm-orchest-ia`.

```
npm install -g swarm-orchest-ia
soia init
soia update
soia models
```

> No confundir con los nombres del **producto** que el CLI genera (agentes `swarm-*`, carpeta
> `swarmspec/`, comandos `/swarm-propose`): esos **no** cambian. Solo cambia el comando del CLI.

## Consecuencias

- Implementar el rename (F19): `bin` en `package.json`, `program.name()` en `src/cmd/swarm.ts` y los
  ejemplos `swarm <subcomando>` en la documentación.
- Hacerlo **antes** de la primera publicación en npm (F11) para no romper a usuarios después.

## Alternativas consideradas

- **`swarm`**: intuitivo pero genérico; el riesgo de colisión real es bajo (Docker usa `docker swarm`,
  no un binario `swarm`), pero se prefirió algo más corto y propio.
- **`swarmo` / `sorch` / `orchia`**: brandables y libres, pero se priorizó un comando de 3-4 letras.
- **`swo` / `sia` / `orc`**: descartados frente a `soia` por claridad/relación con la marca.
