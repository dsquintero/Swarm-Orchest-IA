import * as os from 'os';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Artifact, RenderContext, Scope, ToolAdapter } from './types';
import { resolveProjectPlaceholders } from './canonical';

/** Resolve OpenCode-specific body tags. */
function resolveTags(text: string): string {
  // Delegation: {{soia:delegate:soia-explorer}} -> @soia-explorer
  return text.replace(/\{\{soia:delegate:([a-z0-9-]+)\}\}/g, '@$1');
}

function frontmatter(obj: Record<string, any>): string {
  return `---\n${yaml.dump(obj, { lineWidth: -1 })}---\n\n`;
}

/** Base directory for agents/skills/commands, by scope. */
function nativeBase(scope: Scope, projectDir: string): string {
  return scope === 'global'
    ? path.join(os.homedir(), '.config', 'opencode')
    : path.join(projectDir, '.opencode');
}

function renderAgent(a: Artifact, ctx: RenderContext, body: string): string {
  const cfg = ctx.config[a.id];
  if (!cfg || !cfg.primary) {
    throw new Error(`Missing model for agent '${a.id}' in .agents-conf.yaml (opencode)`);
  }
  const meta = a.meta;
  const caps = (meta.capabilities || {}) as Record<string, boolean>;
  const fm: Record<string, any> = {
    description: meta.description,
    mode: meta.role,
    model: cfg.primary,
    temperature: cfg.temperature,
  };
  if (meta.delegatesTo || meta.writeScopes) {
    const perm: Record<string, any> = {};
    if (Array.isArray(meta.delegatesTo)) {
      perm.task = {};
      for (const g of meta.delegatesTo) perm.task[g] = 'allow';
    }
    if (Array.isArray(meta.writeScopes) && caps.write) {
      perm.write = {};
      for (const s of meta.writeScopes) perm.write[s] = 'allow';
    }
    if (Array.isArray(meta.writeScopes) && caps.edit) {
      perm.edit = {};
      for (const s of meta.writeScopes) perm.edit[s] = 'allow';
    }
    if (caps.bash) perm.bash = 'allow';
    fm.permission = perm;
  } else {
    fm.tools = { write: !!caps.write, edit: !!caps.edit, bash: !!caps.bash };
  }
  if (meta.color) fm.color = meta.color;
  return frontmatter(fm) + body.replace(/^\s*\n/, '');
}

function renderCommand(a: Artifact, body: string): string {
  const meta = a.meta;
  const fm: Record<string, any> = { description: meta.description };
  if (meta.runs) fm.agent = meta.runs;
  return frontmatter(fm) + body.replace(/^\s*\n/, '');
}

export const opencodeAdapter: ToolAdapter = {
  toolId: 'opencode',

  getFilePath(artifact: Artifact, scope: Scope, projectDir: string): string {
    const base = nativeBase(scope, projectDir);
    switch (artifact.kind) {
      case 'agent':
        return path.join(base, 'agents', `${artifact.id}.md`);
      case 'command':
        return path.join(base, 'commands', `${artifact.id}.md`);
      case 'skill':
        return path.join(base, 'skills', artifact.id, 'SKILL.md');
      case 'context':
        // Context + config are always project-local, regardless of scope.
        return path.join(projectDir, 'AGENTS.md');
      case 'config':
        return path.join(projectDir, 'opencode.json');
    }
  },

  render(artifact: Artifact, ctx: RenderContext): string | null {
    if (artifact.kind === 'config') {
      const json = { name: ctx.projectName, description: `Soia SDD project for ${ctx.projectName}` };
      return JSON.stringify(json, null, 2) + '\n';
    }

    const body = resolveTags(resolveProjectPlaceholders(artifact.body, ctx));

    switch (artifact.kind) {
      case 'agent':
        return renderAgent(artifact, ctx, body);
      case 'command':
        return renderCommand(artifact, body);
      case 'skill':
      case 'context':
        // Pass-through (tool-neutral content); placeholders/tags already resolved.
        return body;
    }
  },
};
