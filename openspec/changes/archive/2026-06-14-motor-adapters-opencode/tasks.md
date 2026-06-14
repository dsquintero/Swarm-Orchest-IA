## 1. Fuente canónica (F30)

- [x] 1.1 Crear `templates/canonical/{agents,skills,commands,context,defaults}` y mover el contenido desde `templates/opencode/`
- [x] 1.2 Convertir el frontmatter de cada agente a **neutro** (`role`, `capabilities`, `delegatesTo`, `color`); quitar el marcador-comentario de modelo (el adapter inyecta por agent id)
- [x] 1.3 Neutralizar el **cuerpo** de los agentes: `@<agente>` → `{{soia:delegate:<agente>}}`; "Load skill X" → `{{soia:skill:X}}`
- [x] 1.4 Mover `AGENTS.md` a `templates/canonical/context/AGENTS.md` (conservar placeholders `{{PROJECT_NAME}}`/`{{STACK_*}}`)
- [x] 1.5 Neutralizar los comandos (`agent:` en frontmatter, referencias a skills/agentes en el cuerpo)
- [x] 1.6 Barrido: confirmar que `templates/canonical/` no tiene sintaxis OpenCode residual (`mode`/`permission`/`color`/`@agente` sueltos)

## 2. Motor de adapters (F6)

- [x] 2.1 `src/lib/adapters/types.ts`: `ArtifactKind`, `Scope`, `Artifact`, `RenderContext`, `ToolAdapter`
- [x] 2.2 `src/lib/adapters/registry.ts`: `AdapterRegistry` (`register`/`get`/`getAll`/`has`)
- [x] 2.3 Loader canónico: parsear frontmatter neutro + body → `Artifact` (en `adapters/` o `lib/canonical.ts`)
- [x] 2.4 `src/lib/adapters/opencode.ts`: `getFilePath` (por kind + scope) y `render` (frontmatter neutro → OpenCode, resolver tags, inyectar modelo por agent id, emitir `AGENTS.md` y `opencode.json`)
- [x] 2.5 `src/lib/adapters/index.ts`: re-exports + registrar el adapter OpenCode

## 3. init sin symlinks (F2)

- [x] 3.1 Reescribir `src/lib/init.ts`: resolver `adapter = registry.get(tool)`, render por artefacto a la ruta nativa (local/global), sin symlinks ni copia central a `~/.config/soia/templates/`
- [x] 3.2 Eliminar `fsutil.createSymlink` (y usos)
- [x] 3.3 Ajustar `src/lib/update.ts` para re-renderizar por adapter (parche mínimo; F31 lo formaliza) — que no quede roto

## 4. Tests y verificación

- [x] 4.1 Actualizar `tests/templates.test.ts` a `templates/canonical/` y al nuevo contrato (modelo inyectado por adapter, no por marcador)
- [x] 4.2 Nuevos tests del adapter: render de un agente → comparar con fixture esperado de OpenCode; verificar rutas por scope y que **no** se crea symlink
- [x] 4.3 `npm test` y `npm run build` en verde
- [x] 4.4 `openspec validate "motor-adapters-opencode" --strict` en verde
