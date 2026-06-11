import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { isSwarmAgent, needsInjection, injectIntoAgent } from '../src/lib/injector';
import type { Config } from '../src/lib/agentsconf';

const AGENTS_DIR = path.join(__dirname, '..', 'templates', 'opencode', 'agents');

const EXPECTED_AGENTS = [
  'swarm-orchestrator',
  'swarm-explorer',
  'swarm-specifier',
  'swarm-designer',
  'swarm-implementer',
  'swarm-verifier',
];

const testConfig: Config = Object.fromEntries(
  EXPECTED_AGENTS.map((name) => [
    name,
    { primary: 'opencode-go/test-model', fallback: 'opencode-go/fallback', temperature: 0.2 },
  ]),
);

describe('agent templates integrity', () => {
  it('ships exactly the six expected swarm agents', () => {
    const files = fs.readdirSync(AGENTS_DIR).filter(isSwarmAgent).sort();
    expect(files).toEqual(EXPECTED_AGENTS.map((n) => `${n}.md`).sort());
  });

  for (const name of EXPECTED_AGENTS) {
    describe(name, () => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, `${name}.md`), 'utf-8');

      it('starts with YAML frontmatter', () => {
        expect(content.startsWith('---')).toBe(true);
      });

      it('contains the injection marker (no hardcoded model)', () => {
        expect(needsInjection(content)).toBe(true);
        expect(content).not.toMatch(/^model:/m);
      });

      it('is injectable: marker is replaced by model and temperature', () => {
        const injected = injectIntoAgent(content, name, testConfig);
        expect(injected).toContain('model: opencode-go/test-model');
        expect(injected).toContain('temperature: 0.2');
        expect(needsInjection(injected)).toBe(false);
      });
    });
  }
});
