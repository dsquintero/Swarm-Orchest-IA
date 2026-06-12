# ADR 0006 — Modo global/local explícito en `init`

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

El PROPOSAL planteaba symlinks con fallback automático a copias según el Developer Mode de Windows.
En la práctica, detectar el modo de forma confiable es frágil y poco transparente.

## Decisión

Ofrecer una **elección explícita** en `init`: **global** (symlinks a plantillas centrales) o **local**
(copias autocontenidas), vía prompt o flags `-g`/`-l`. Es una desviación intencional del PROPOSAL.

## Consecuencias

- El usuario decide con conocimiento de causa (compartir vs. autocontenido).
- En Windows sin Developer Mode, el modo **local** es el camino que funciona.
- **Pendiente** (F2 en ROADMAP): fallback automático symlink→copia cuando el symlink falla, para
  robustecer el modo global.

## Alternativas consideradas

- **Fallback automático por Developer Mode** (propuesta original): poco transparente y frágil de
  detectar. Descartada como mecanismo principal; se evalúa como red de seguridad (F2).
