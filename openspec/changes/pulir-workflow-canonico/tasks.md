## 1. De-sesgo de stack (D1)

- [x] 1.1 `templates/opencode/agents/soia-explorer.md`: reemplazar ejemplos .NET del template de `exploration.md` (`Controller.cs`/`Entity.cs`/`Startup.cs`, MediatR, FluentValidation) por ejemplos stack-neutrales + "follow AGENTS.md"
- [x] 1.2 `templates/opencode/agents/soia-specifier.md`: reemplazar ejemplos concretos (`UserController`, `NotFound()`, `/api/usuarios`) por neutros; mantener las reglas de formato fuera (van en la skill)
- [x] 1.3 `templates/opencode/agents/soia-designer.md`: reemplazar el data-flow y los file-changes .NET (`UsuarioController`, `MediatR`, `CreateUsuarioCommand`, EF) por ejemplos neutros
- [x] 1.4 `templates/opencode/skills/soia-format/SKILL.md`: reemplazar ejemplos (`/api/usuarios`, `CreateUserHandler`, `FluentValidation`) por neutros, manteniendo el contrato GIVEN/WHEN/THEN
- [x] 1.5 Revisar `soia-implementer.md` y `soia-verifier.md`: dejar las menciones de testing balanceadas/neutras (sin asumir un stack)

## 2. Skills como única fuente (D2)

- [x] 2.1 `templates/opencode/skills/{soia-format,soia-delta,soia-archive}/SKILL.md`: confirmar que contienen las reglas completas (formato / delta / merge) — son la fuente
- [x] 2.2 `templates/opencode/agents/soia-orchestrator.md` (sección Archiving): quitar los pasos de merge re-escritos; dejar la orquestación (validar, confirmar, `.status.yaml`, mover carpeta) + "Load skill `soia-archive`"
- [x] 2.3 `templates/opencode/commands/soia-archive.md`: quitar los pasos de merge re-escritos; dejar orquestación + referencia a la skill `soia-archive`
- [x] 2.4 `templates/opencode/agents/soia-specifier.md`: asegurar que referencia las skills `soia-format`/`soia-delta` y no duplica sus reglas

## 3. Quitar Engram por completo (D3)

- [x] 3.1 `soia-orchestrator.md`: eliminar la sección "Engram Integration" por completo (sin línea opcional)
- [x] 3.2 `soia-explorer.md`: eliminar la sección "Engram Integration" por completo
- [x] 3.3 `soia-designer.md`: eliminar la mención inline de Engram por completo
- [x] 3.4 Barrer los 6 agentes (`soia-orchestrator/explorer/specifier/designer/implementer/verifier`) y confirmar **cero** referencias a Engram

## 4. Verificación y contrato

- [x] 4.1 Confirmar que cada agente `soia-*` conserva el marcador de inyección de modelo en su frontmatter
- [x] 4.2 `npm test` (incluye `tests/templates.test.ts`) y `npm run build` en verde
- [x] 4.3 `openspec validate "pulir-workflow-canonico" --strict` en verde
