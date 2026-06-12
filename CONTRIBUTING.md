# Contribuir a Swarm-Orchest-IA

¡Gracias por sumarte! Esta guía explica cómo proponer, implementar y entregar cambios sin pisarnos.

## TL;DR del flujo

```
ROADMAP.md → Issue #N → (si no trivial) /opsx:propose → feature/N desde develop → PR a develop ("Closes #N") → CI verde → merge
```

1. Elegí un Issue del board (columna **Backlog**) y auto-asignátelo (o creá uno con la plantilla).
2. Si la feature es **no trivial**, generá el diseño con OpenSpec: `/opsx:propose "<descripción>"`.
3. Creá un branch **desde `develop`**: `feature/<n>-<slug>` (o `bugfix/<n>-<slug>`).
4. Implementá **con tests**.
5. Abrí un PR **hacia `develop`** que referencie el Issue (`Closes #N`) y actualizá la fila en `ROADMAP.md`.
6. CI debe estar verde antes del merge (es obligatorio por la protección de rama).

## Modelo de ramas (GitFlow)

| Rama | Rol |
|---|---|
| `main` | Producción. Solo recibe releases (merge desde `release/*` o `hotfix/*`) y se taggea (`vX.Y.Z`). **Protegida**. |
| `develop` | Integración y **rama default**. Acá se acumulan las features listas para el próximo release. **Protegida**. |
| `feature/<n>-<slug>` | Nueva funcionalidad del producto. Sale de `develop` y vuelve a `develop` por PR. |
| `bugfix/<n>-<slug>` | Corrección sobre trabajo en `develop`. Mismo flujo que feature. |
| `chore/<slug>` | Todo lo que no es producto: config, tooling, deps, archivos meta **y documentación**. Sale de `develop`. |
| `release/X.Y.Z` | Preparar un release. Sale de `develop`; al cerrar, mergea a `main` (con tag) **y** de vuelta a `develop`. |
| `hotfix/X.Y.Z` | Arreglo urgente de producción. Sale de `main`; al cerrar, mergea a `main` (con tag) **y** a `develop`. |

> El prefijo de rama es **grueso** (señala la intención y agrupa). La precisión fina la da el **tipo de
> commit** (`docs:`, `chore:`, `ci:`…). Por eso una sola rama `chore/*` cubre mantenimiento y docs;
> `feature/*` y `bugfix/*` llevan número de issue, `chore/*` no siempre.

Reglas:
- **Nunca** commitees directo a `main` ni `develop` (protegidas; todo entra por PR con CI en verde).
- `release/*` y `hotfix/*` son **temporales** y las maneja quien hace el release; se borran al mergear.
- Borrá tu `feature/*` después del merge.

## Setup local

Requiere **Node.js 20+**.

```bash
npm install        # instalar dependencias (desde la raíz)
npm run build      # compilar TS → dist/
npm test           # correr la suite (Vitest)
npm run test:watch # tests en modo watch mientras desarrollás
```

Probar el CLI sin compilar: `npm run dev -- <comando>` (ej: `npm run dev -- init /tmp/test`).

## Dónde va cada cosa

- **Código del CLI**: `src/` (`cmd/swarm.ts` + `lib/`).
- **Plantillas canónicas**: `templates/opencode/` — **editá acá** (es la copia que instala el CLI).
- **Tests**: `tests/*.test.ts`.
- **Diseño de features (este repo)**: `openspec/` vía `/opsx:*`.

Ver [AGENTS.md](AGENTS.md) para la arquitectura completa y la distinción herramienta vs. producto.

## Convenciones

- **Idioma**: código y comentarios en **inglés**; documentación de usuario en **español**. Mantené
  el idioma del archivo que tocás.
- **Sin dependencias nuevas** de runtime salvo justificación clara (mantener el CLI liviano es un objetivo).
- **No rompas el marcador de inyección** de modelo en las plantillas de agentes
  (`# model y temperature se inyectan desde ~/.config/swarm/.agents-conf.yaml`). El test
  `tests/templates.test.ts` lo protege.
- **No rompas el contrato de paths**: `.swarm/config.yaml` marca un proyecto inicializado.

## Commits y PRs

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.
- **PRs chicos**: 1 funcionalidad por PR. Si crece, partilo.
- El PR debe: pasar CI (`build` + `test`), incluir tests para lógica nueva, y actualizar docs/ROADMAP si aplica.
- **Sin atribución de IA**: no incluyas `Co-Authored-By: <IA>` ni "Generated with…" en commits ni en
  el cuerpo del PR, sea cual sea el agente que uses (Claude, Copilot, OpenCode, Codex, etc.).

## ¿Cuándo uso OpenSpec y cuándo no?

| Caso | OpenSpec | Solo Issue + PR |
|---|---|---|
| Feature nueva no trivial (cambia comportamiento, agrega comando) | ✅ `/opsx:propose` | |
| Bug fix, refactor chico, docs, ajuste de plantilla | | ✅ |

Comandos OpenSpec: `/opsx:propose` → `/opsx:apply` → `/opsx:archive`.

## Reportar bugs o pedir features

Usá las plantillas de Issue (Bug report / Feature request). Incluí pasos de reproducción, SO y
versión de Node cuando reportes un bug.
