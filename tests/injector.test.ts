import { describe, it, expect } from 'vitest';
import {
  injectIntoAgent,
  injectInto,
  isSoiaAgent,
  agentNameFromFilename,
  needsInjection,
} from '../src/lib/injector';
import type { Config } from '../src/lib/agentsconf';

const MARKER = '# model y temperature se inyectan desde ~/.config/soia/.agents-conf.yaml';

const config: Config = {
  'soia-explorer': {
    primary: 'opencode-go/deepseek-v4-flash',
    fallback: 'opencode-go/minimax-m2.7',
    temperature: 0.1,
  },
};

function agentTemplate(): string {
  return [
    '---',
    'description: Investigates the codebase',
    'mode: subagent',
    MARKER,
    'tools:',
    '  write: true',
    '  edit: false',
    '---',
    '',
    'You are the Soia Explorer.',
  ].join('\n');
}

describe('isSoiaAgent', () => {
  it('accepts soia-*.md files', () => {
    expect(isSoiaAgent('soia-explorer.md')).toBe(true);
  });

  it('rejects non-soia or non-md files', () => {
    expect(isSoiaAgent('explorer.md')).toBe(false);
    expect(isSoiaAgent('soia-explorer.txt')).toBe(false);
    expect(isSoiaAgent('AGENTS.md')).toBe(false);
  });
});

describe('agentNameFromFilename', () => {
  it('strips the .md extension', () => {
    expect(agentNameFromFilename('soia-explorer.md')).toBe('soia-explorer');
  });
});

describe('needsInjection', () => {
  it('is true when the marker is present', () => {
    expect(needsInjection(agentTemplate())).toBe(true);
  });

  it('is false when the marker is absent', () => {
    expect(needsInjection('---\nmodel: foo\n---')).toBe(false);
  });
});

describe('injectIntoAgent', () => {
  it('replaces the marker with model and temperature from config', () => {
    const result = injectIntoAgent(agentTemplate(), 'soia-explorer', config);
    expect(result).toContain('model: opencode-go/deepseek-v4-flash');
    expect(result).toContain('temperature: 0.1');
    expect(result).not.toContain(MARKER);
  });

  it('keeps the body intact', () => {
    const result = injectIntoAgent(agentTemplate(), 'soia-explorer', config);
    expect(result).toContain('You are the Soia Explorer.');
    expect(result).toContain('  write: true');
  });

  it('returns content unchanged when the agent is not in config', () => {
    const content = agentTemplate();
    expect(injectIntoAgent(content, 'soia-unknown', config)).toBe(content);
  });

  it('returns content unchanged when there is no marker', () => {
    const content = '---\nmodel: already-set\n---\nbody';
    expect(injectIntoAgent(content, 'soia-explorer', config)).toBe(content);
  });

  it('is a no-op on its own output (marker already consumed)', () => {
    const once = injectIntoAgent(agentTemplate(), 'soia-explorer', config);
    const twice = injectIntoAgent(once, 'soia-explorer', config);
    expect(twice).toBe(once);
  });
});

describe('injectInto', () => {
  it('replaces the marker with the given model and temperature', () => {
    const result = injectInto(agentTemplate(), 'opencode-go/glm-5', 0.2);
    expect(result).toContain('model: opencode-go/glm-5');
    expect(result).toContain('temperature: 0.2');
    expect(result).not.toContain(MARKER);
  });

  it('is idempotent: re-injecting replaces the existing model/temperature', () => {
    const first = injectInto(agentTemplate(), 'opencode-go/glm-5', 0.2);
    const second = injectInto(first, 'opencode-go/kimi-k2.6', 0.4);
    expect(second).toContain('model: opencode-go/kimi-k2.6');
    expect(second).toContain('temperature: 0.4');
    expect(second).not.toContain('model: opencode-go/glm-5');
    // exactly one model line and one temperature line
    expect(second.match(/^model:/gm)?.length).toBe(1);
    expect(second.match(/^temperature:/gm)?.length).toBe(1);
  });
});
