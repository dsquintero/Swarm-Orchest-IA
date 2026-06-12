# Estrategia de tests

> Usamos **Vitest**. Los tests viven en `tests/*.test.ts` y corren con `npm test`
> (`npm run test:watch` para watch, `npm run coverage` para cobertura).

## Qué se cubre hoy

| Test | Cubre |
|---|---|
| [`tests/injector.test.ts`](../tests/injector.test.ts) | Inyección de modelo, idempotencia, no-ops, detección de agentes |
| [`tests/agentsconf.test.ts`](../tests/agentsconf.test.ts) | `load/save/merge` YAML, paths bajo `HOME`, `fileExists` |
| [`tests/fsutil.test.ts`](../tests/fsutil.test.ts) | `copyFile/copyDir/ensureDir`, `resolveProjectDir`, `isInitialized` |
| [`tests/templates.test.ts`](../tests/templates.test.ts) | Integridad: los 6 agentes mantienen el marcador y son inyectables |

**Gap conocido**: la **capa de comandos** (`init/update/fallback/models`) aún no tiene tests
(ver F3 en [ROADMAP.md](../ROADMAP.md)).

## Principios

- **Núcleos puros primero**: la lógica determinista (injector, agentsconf, fsutil) se testea en
  aislamiento, sin tocar el FS global del usuario.
- **Tests con FS temporal**: usá `fs.mkdtempSync(path.join(os.tmpdir(), '...'))` en `beforeEach` y
  limpiá en `afterEach`. Nunca escribas en `~/.config/swarm` real.
- **`HOME` aislado**: si testeás funciones que dependen de `HOME`, seteá `process.env.HOME` a un temp
  y restaurá el valor original después.
- **Proteger contratos**: cualquier cambio al marcador de inyección o a los paths esperados debe
  romper un test (es intencional).

## Cómo agregar tests

1. Creá `tests/<modulo>.test.ts`.
2. Importá desde `../src/lib/<modulo>`.
3. `describe`/`it`/`expect` de `vitest` (sin globals).
4. Para lógica nueva en un PR, **agregá tests** — es requisito de [CONTRIBUTING.md](../CONTRIBUTING.md).

## Cobertura

`vitest.config.ts` mide cobertura sobre `src/**` excluyendo `src/cmd/**` (el entry point). Generala
con `npm run coverage`.
