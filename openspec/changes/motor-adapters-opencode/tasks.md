## 1. Fuente canónica (F30)

- [ ] 1.1 Crear `templates/canonical/{agents,skills,commands,context,defaults}` y mover el contenido desde `templates/opencode/`
- [ ] 1.2 Convertir el frontmatter de cada agente a **neutro** (`role`, `capabilities`, `delegatesTo`, `color`); quitar el marcador-comentario de modelo (el adapter inyecta por agent id)
- [ ] 1.3 Neutralizar el **cuerpo** de los agentes: `@<agente>` → `{{soia:delegate:<agente>}}`; "Load skill X" → `{{soia:skill:X}}`
- [ ] 1.4 Mover `AGENTS.md` a `templates/canonical/context/AGENTS.md` (conservar placeholders `{{PROJECT_NAME}}`/`{{STACK_*}}`)
- [ ] 1.5 Neutralizar los comandos (`agent:` en frontmatter, referencias a skills/agentes en el cuerpo)
- [ ] 1.6 Barrido: confirmar que `templates/canonical/` no tiene sintaxis OpenCode residual (`mode`/`permission`/`color`/`@agente` sueltos)

## 2. Motor de adapters (F6)

- [ ] 2.1 `src/lib/adapters/types.ts`: `ArtifactKind`, `Scope`, `Artifact`, `RenderContext`, `ToolAdapter`
- [ ] 2.2 `src/lib/adapters/registry.ts`: `AdapterRegistry` (`register`/`get`/`getAll`/`has`)
- [ ] 2.3 Loader canónico: parsear frontmatter neutro + body → `Artifact` (en `adapters/` o `lib/canonical.ts`)
- [ ] 2.4 `src/lib/adapters/opencode.ts`: `getFilePath` (por kind + scope) y `render` (frontmatter neutro → OpenCode, resolver tags, inyectar modelo por agent id, emitir `AGENTS.md` y `opencode.json`)
- [ ] 2.5 `src/lib/adapters/index.ts`: re-exports + registrar el adapter OpenCode

## 3. init sin symlinks (F2)

- [ ] 3.1 Reescribir `src/lib/init.ts`: resolver `adapter = registry.get(tool)`, render por artefacto a la ruta nativa (local/global), sin symlinks ni copia central a `~/.config/soia/templates/`
- [ ] 3.2 Eliminar `fsutil.createSymlink` (y usos)
- [ ] 3.3 Ajustar `src/lib/update.ts` para re-renderizar por adapter (parche mínimo; F31 lo formaliza) — que no quede roto

## 4. Tests y verificación

- [ ] 4.1 Actualizar `tests/templates.test.ts` a `templates/canonical/` y al nuevo contrato (modelo inyectado por adapter, no por marcador)
- [ ] 4.2 Nuevos tests del adapter: render de un agente → comparar con fixture esperado de OpenCode; verificar rutas por scope y que **no** se crea symlink
- [ ] 4.3 `npm test` y `npm run build` en verde
- [ ] 4.4 `openspec validate "motor-adapters-opencode" --strict` en verde
