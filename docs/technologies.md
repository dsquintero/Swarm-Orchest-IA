# Tecnologías y stack

> Qué usa el CLI y por qué. La regla rectora es **mantenerlo liviano**: no se agregan dependencias de
> runtime sin justificación clara.

## Runtime y lenguaje

- **TypeScript + Node.js** (CommonJS, `target` ES2022). Se eligió TS porque es la stack que el equipo
  domina (ver ADR 0001 en [decisions/](decisions/)). El PROPOSAL original mencionaba Go.

## Dependencias de runtime

| Librería | Para qué | Por qué |
|---|---|---|
| **commander** | Parsing de comandos y flags | Estándar de facto, liviano, declarativo |
| **js-yaml** | Leer/escribir `.agents-conf.yaml` y metadatos | YAML es el formato de config del proyecto |
| **inquirer** | Prompts interactivos (modo global/local) | Prompts robustos multiplataforma |
| **ora** | Spinners de progreso | UX de CLI durante operaciones de FS |
| **chalk** | Color en la salida | Legibilidad de la salida |

> Antes de sumar una dependencia nueva, registrá la justificación (idealmente una ADR) y confirmá con
> el usuario.

## Tooling de desarrollo

| Herramienta | Uso |
|---|---|
| **tsc** | Compila `src/` → `dist/` (`npm run build`) |
| **ts-node** | Ejecutar sin compilar (`npm run dev -- <cmd>`) |
| **Vitest** | Tests (`npm test`), watch y coverage. Ver [testing.md](testing.md) |
| **rimraf** | Limpieza de `dist/` previa al build |

## Configuración de TypeScript

`tsconfig.json`: `strict: true`, `module: commonjs`, `outDir: dist`, `rootDir: src`,
`declaration` + `sourceMap`. `tests/` queda fuera del build (`include: ["src/**/*"]`), por lo que los
tests no se compilan a `dist/`.

## Empaquetado

`package.json` define `bin.swarm → dist/cmd/swarm.js` y un allowlist `files: ["dist/", "templates/"]`,
de modo que `docs/`, `openspec/` y `tests/` no se publican.
