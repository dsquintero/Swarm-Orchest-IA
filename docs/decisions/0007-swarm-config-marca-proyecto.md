# ADR 0007 — `.soia/config.yaml` marca proyecto inicializado

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

El CLI necesita una forma confiable de saber si un directorio ya es un proyecto Soia. El PROPOSAL
mencionaba un `.soia.yaml` en la raíz.

## Decisión

Usar **`.soia/config.yaml`** (dentro de la carpeta de metadatos `.soia/`) como marca de proyecto
inicializado. `isInitialized()` verifica su existencia; `update`/`fallback`/`models` fallan sin él.

## Consecuencias

- Todos los metadatos locales viven juntos en `.soia/` (`config.yaml`, `current.yaml`,
  `.agents-conf.yaml`).
- **Contrato a proteger**: no cambiar esta ruta sin actualizar `fsutil.isInitialized` y los tests.
- Los defaults `soia.yaml`/`soia-config.yaml` quedaron sin uso (ver F5 en ROADMAP).

## Alternativas consideradas

- **`.soia.yaml` en la raíz** (propuesta original): dispersa los metadatos. Descartada.
