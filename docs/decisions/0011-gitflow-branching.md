# ADR 0011 — Modelo de ramas GitFlow

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

El repo es colaborativo (varias personas y agentes de IA). Necesitamos un modelo de ramas claro que
separe lo que está en producción de lo que está en integración, y que permita releases y arreglos
urgentes de forma ordenada.

## Decisión

Adoptar **GitFlow**:

- **`main`** — producción. Solo recibe releases (merge desde `release/*` o `hotfix/*`) y se taggea
  `vX.Y.Z`. Protegida.
- **`develop`** — integración y **rama default** del repo. Acumula las features del próximo release.
  Protegida.
- **`feature/<n>-<slug>`** / **`bugfix/<n>-<slug>`** — salen de `develop` y vuelven por PR a `develop`.
- **`release/X.Y.Z`** — temporal; sale de `develop`, al cerrar mergea a `main` (con tag) y a `develop`.
- **`hotfix/X.Y.Z`** — temporal; sale de `main`, al cerrar mergea a `main` (con tag) y a `develop`.

**Protección** (main y develop): no se permite push directo; todo entra por PR con CI en verde. Sin
revisores obligatorios por ahora (equipo chico). El owner (admin) puede bypassear en una emergencia.

## Consecuencias

- El trabajo diario apunta a `develop`; `main` queda siempre desplegable.
- CI corre en PRs y push a `main` y `develop`.
- Las features se integran de forma aislada y trazable (1 issue → 1 `feature/*` → 1 PR).
- Las ramas permanentes `release` y `hotfix` que existían se eliminaron: en GitFlow son temporales con
  prefijo (`release/*`, `hotfix/*`).

## Alternativas consideradas

- **Trunk-based / solo `main`**: más simple, pero sin separación entre integración y producción.
  Descartada para este flujo.
- **GitHub Flow** (ramas de feature → main directo): bueno para entrega continua, pero no modela
  releases/hotfix tan explícitamente. Descartada por ahora.
