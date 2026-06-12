# ADR 0007 — `.swarm/config.yaml` marca proyecto inicializado

- **Estado**: Aceptada
- **Fecha**: 2026-06-11

## Contexto

El CLI necesita una forma confiable de saber si un directorio ya es un proyecto Swarm. El PROPOSAL
mencionaba un `.swarm.yaml` en la raíz.

## Decisión

Usar **`.swarm/config.yaml`** (dentro de la carpeta de metadatos `.swarm/`) como marca de proyecto
inicializado. `isInitialized()` verifica su existencia; `update`/`fallback`/`models` fallan sin él.

## Consecuencias

- Todos los metadatos locales viven juntos en `.swarm/` (`config.yaml`, `current.yaml`,
  `.agents-conf.yaml`).
- **Contrato a proteger**: no cambiar esta ruta sin actualizar `fsutil.isInitialized` y los tests.
- Los defaults `swarm.yaml`/`swarm-config.yaml` quedaron sin uso (ver F5 en ROADMAP).

## Alternativas consideradas

- **`.swarm.yaml` en la raíz** (propuesta original): dispersa los metadatos. Descartada.
