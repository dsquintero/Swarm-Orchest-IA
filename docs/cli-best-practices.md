# Buenas prácticas de CLI (Commander)

> Lecciones aplicables al CLI `soia`, destiladas del análisis de **[OpenSpec](https://github.com/Fission-AI/OpenSpec)**
> (`@fission-ai/openspec`), un orquestador de SDD con un stack casi idéntico al nuestro
> (Commander + inquirer + ora + chalk + yaml). Acá quedan los **patrones** que vale la pena adoptar;
> el estado por feature vive en [ROADMAP.md](../ROADMAP.md) (F13, F21–F23).

Este CLI lo consumen **tres audiencias**: personas en una terminal, **agentes de IA** y **pipelines de
CI**. Varias de estas prácticas existen justamente para no romperse con las dos últimas.

## 1. Detección de interactividad (el más importante para nosotros)

Nunca dispares un prompt (`inquirer`) sin antes verificar que hay con quién interactuar. Un agente o un
job de CI no responde y el proceso se cuelga. OpenSpec usa un helper así:

```ts
export function isInteractive(opts?: { noInteractive?: boolean; interactive?: boolean }): boolean {
  if (opts?.noInteractive === true || opts?.interactive === false) return false; // --no-interactive
  if (process.env.SOIA_INTERACTIVE === '0') return false;
  if ('CI' in process.env) return false;        // GitHub Actions, GitLab, etc.
  return !!process.stdin.isTTY;                  // ¿hay terminal real?
}
```

Regla: **si `!isInteractive()` y falta un dato obligatorio, fallá con un error claro**, no preguntes.
Esto es F21 en el roadmap.

## 2. `--json` como contrato de salida

Todo comando de **lectura** (`models`, `fallback`, futuros `list`/`status`) debe ofrecer `--json` con
salida **determinista** (sin colores, sin spinners, sin texto decorativo). Es lo que un agente parsea.
Implicancias:

- En modo `--json`, escribí **solo** el JSON a `stdout`; cualquier diagnóstico va a `stderr`.
- Mantené el shape estable: es una API. Cambios rompen tooling aguas abajo.

Es F13.

## 3. Disciplina de exit codes: `process.exit()` vs `process.exitCode`

- `process.exit(1)` **corta ya** — puede **truncar** un `stdout` grande aún sin vaciar (riesgo real con
  `--json`).
- `process.exitCode = 1` marca el fallo pero **deja terminar** el flush de buffers. Preferilo cuando ya
  imprimiste salida.
- Para comandos "silenciosos" (ej. completions de shell), fallá con `exitCode` y sin ruido en `stderr`.

## 4. Versión desde `package.json` (una sola fuente de verdad)

No hardcodear la versión en el `.version('…')`. Drift garantizado en cada release. OpenSpec la lee del
`package.json`:

```ts
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('../../package.json'); // o un import del package.json en CJS
program.name('soia').version(version);
```

Es F22. (Nuestro `src/cmd/soia.ts` hoy tiene `'0.1.0'` literal.)

## 5. Hooks de ciclo de vida para cross-cutting concerns

En vez de repetir lógica en cada `.action()`, usá los hooks de Commander:

```ts
program.option('--no-color', 'Disable color output');
program.hook('preAction', (thisCommand, actionCommand) => {
  if (thisCommand.opts().color === false) process.env.NO_COLOR = '1'; // estándar NO_COLOR
  // acá también: warnings de deprecación, validaciones globales
});
program.hook('postAction', async () => { /* cleanup */ });
```

`preAction` recibe `(thisCommand, actionCommand)`: `thisCommand` es donde se registró el hook (root);
`actionCommand` es el subcomando que realmente corre. Es F23.

## 6. Imports dinámicos (lazy) para arranque rápido

Cargá los módulos pesados (y `inquirer`) **solo cuando el comando los necesita**. Mantener el arranque
liviano es un objetivo explícito del proyecto.

```ts
.action(async (path, opts) => {
  const { runInit } = await import('../lib/init.js'); // se carga al ejecutar, no al parsear
  // y dentro, solo si vas a preguntar:
  if (isInteractive(opts)) {
    const { select } = await import('@inquirer/prompts');
  }
});
```

## 7. Comandos ocultos y alias de deprecación

Para evolucionar el CLI sin romper usuarios:

- `program.command('__internal', { hidden: true })` para comandos de máquina (no aparecen en `--help`).
- Alias deprecado → comando nuevo, con un `preAction` que imprime el warning a `stderr` y delega.

```ts
const old = program.command('viejo', { hidden: true });
old.hook('preAction', () => console.error('Aviso: "soia viejo" está deprecado. Usá "soia nuevo".'));
```

## 8. Modularización: entry point fino + `register*`

Cuando el CLI pase de ~6 comandos, mové cada grupo a su archivo y exportá un
`registerXCommand(program)` que recibe el root. El `soia.ts` queda como **composition root** que solo
arma el árbol. Hoy (4 comandos inline) todavía no hace falta, pero es el camino.

## 9. Patrón adapter + registry (multi-tool)

OpenSpec valida nuestro modelo de [ADR 0013](decisions/0013-canonical-source-adapters.md): **un archivo
chico por tool** que implementa una interfaz común (`toolId` + ruta nativa + render), más un **registry**
estático (`register/get/getAll/has`). El detalle de cómo lo estructuramos nosotros (con `kind`, `scope`
e inyección de modelo) está en la propia ADR 0013.

---

## Qué NO copiar de OpenSpec

Su repo es mucho más grande (~150 archivos). Para mantener el CLI liviano (objetivo explícito,
"sin deps nuevas salvo justificación"):

- **Telemetría** (`posthog-node`): la evitamos — choca con la sensibilidad de privacidad de un CLI OSS.
- **Subsistema de shell completions** (bash/zsh/fish/powershell + comando `__complete`): potente pero
  pesado; material de roadmap lejano.
- **~30 archivos de adapter**: adoptamos el **patrón**, no el volumen. Un adapter por tool que
  soportemos de verdad, no especulativo.

## Mapeo a nuestro roadmap

| Práctica | Feature |
|---|---|
| Modo no-interactivo (`isInteractive`) | F21 |
| `--version` desde `package.json` | F22 |
| `--no-color` global + hooks de ciclo de vida | F23 |
| Contrato de salida `--json` | F13 |
| Adapter + registry | F6 / F7 (ver [ADR 0013](decisions/0013-canonical-source-adapters.md)) |
