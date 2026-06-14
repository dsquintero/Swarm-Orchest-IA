import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadCanonical, opencodeAdapter, registry, parseFrontmatter } from '../src/lib/adapters';
import type { Config } from '../src/lib/agentsconf';

const CANONICAL = path.join(__dirname, '..', 'templates', 'canonical');
const AGENTS_DIR = path.join(CANONICAL, 'agents');

const EXPECTED_AGENTS = [
  'soia-orchestrator',
  'soia-explorer',
  'soia-specifier',
  'soia-designer',
  'soia-implementer',
  'soia-verifier',
];

const testConfig: Config = Object.fromEntries(
  EXPECTED_AGENTS.map((name) => [
    name,
    { primary: 'opencode-go/test-model', fallback: 'opencode-go/fallback', temperature: 0.2 },
  ])
);

const ctx = {
  config: testConfig,
  projectDir: path.join('/tmp', 'proj'),
  projectName: 'soia-test-app',
  stack: { runtime: 'r', framework: 'f', language: 'l' },
};

describe('canonical agent templates (tool-agnostic source)', () => {
  it('ships exactly the six expected soia agents', () => {
    const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md')).sort();
    expect(files).toEqual(EXPECTED_AGENTS.map((n) => `${n}.md`).sort());
  });

  for (const name of EXPECTED_AGENTS) {
    describe(name, () => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, `${name}.md`), 'utf-8');
      const { meta } = parseFrontmatter(content);

      it('has neutral frontmatter (role + capabilities)', () => {
        expect(meta.role === 'primary' || meta.role === 'subagent').toBe(true);
        expect(typeof meta.capabilities).toBe('object');
      });

      it('has no tool-specific frontmatter and no hardcoded model', () => {
        expect(content).not.toMatch(/^mode:/m);
        expect(content).not.toMatch(/^permission:/m);
        expect(content).not.toMatch(/^tools:/m);
        expect(content).not.toMatch(/^model:/m);
      });

      it('body uses delegate tags, not OpenCode @-mentions', () => {
        expect(content).not.toMatch(/@soia-/);
      });
    });
  }
});

describe('opencode adapter render', () => {
  const artifacts = loadCanonical(CANONICAL);
  const agent = (id: string) => artifacts.find((a) => a.kind === 'agent' && a.id === id)!;

  it('is registered in the registry', () => {
    expect(registry.has('opencode')).toBe(true);
    expect(registry.get('opencode')).toBe(opencodeAdapter);
  });

  it('injects the configured model + temperature into the rendered frontmatter', () => {
    const out = opencodeAdapter.render(agent('soia-explorer'), ctx)!;
    expect(out.startsWith('---')).toBe(true);
    expect(out).toContain('model: opencode-go/test-model');
    expect(out).toContain('temperature: 0.2');
  });

  it('maps role -> mode and capabilities -> tools for subagents', () => {
    const out = opencodeAdapter.render(agent('soia-explorer'), ctx)!;
    expect(out).toMatch(/^mode: subagent/m);
    expect(out).toMatch(/^tools:/m);
  });

  it('maps the orchestrator to permission + scoped task delegation', () => {
    const out = opencodeAdapter.render(agent('soia-orchestrator'), ctx)!;
    expect(out).toMatch(/^mode: primary/m);
    expect(out).toMatch(/^permission:/m);
    expect(out).toContain('task:');
    expect(out).toContain('soia-spec/**');
  });

  it('resolves delegate tags to OpenCode @-mentions', () => {
    const out = opencodeAdapter.render(agent('soia-orchestrator'), ctx)!;
    expect(out).toContain('@soia-explorer');
    expect(out).not.toContain('{{soia:delegate:');
  });

  it('throws a clear error when an agent has no model configured', () => {
    expect(() => opencodeAdapter.render(agent('soia-explorer'), { ...ctx, config: {} })).toThrow(/Missing model/);
  });

  it('resolves native paths by scope without symlinks', () => {
    const a = agent('soia-explorer');
    expect(opencodeAdapter.getFilePath(a, 'project', ctx.projectDir)).toBe(
      path.join(ctx.projectDir, '.opencode', 'agents', 'soia-explorer.md')
    );
    expect(opencodeAdapter.getFilePath(a, 'global', ctx.projectDir)).toContain(
      path.join('.config', 'opencode', 'agents', 'soia-explorer.md')
    );
  });

  it('renders context (AGENTS.md) with project placeholders resolved, always project-local', () => {
    const context = artifacts.find((a) => a.kind === 'context')!;
    const out = opencodeAdapter.render(context, ctx)!;
    expect(out).toContain('soia-test-app');
    expect(out).not.toContain('{{PROJECT_NAME}}');
    expect(opencodeAdapter.getFilePath(context, 'global', ctx.projectDir)).toBe(
      path.join(ctx.projectDir, 'AGENTS.md')
    );
  });

  it('generates the tool config (opencode.json) as project-local JSON', () => {
    const cfg = { kind: 'config' as const, id: 'tool-config', meta: {}, body: '' };
    const out = opencodeAdapter.render(cfg, ctx)!;
    expect(JSON.parse(out).name).toBe('soia-test-app');
    expect(opencodeAdapter.getFilePath(cfg, 'global', ctx.projectDir)).toBe(
      path.join(ctx.projectDir, 'opencode.json')
    );
  });
});
