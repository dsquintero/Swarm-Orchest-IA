import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  load,
  save,
  merge,
  agentNames,
  fileExists,
  soiaConfigDir,
  soiaConfigFile,
  type Config,
} from '../src/lib/agentsconf';

let tmp: string;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'soia-conf-'));
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

const sample: Config = {
  'soia-orchestrator': {
    primary: 'opencode-go/deepseek-v4-pro',
    fallback: 'opencode-go/kimi-k2.6',
    temperature: 0.3,
  },
  'soia-explorer': {
    primary: 'opencode-go/deepseek-v4-flash',
    fallback: 'opencode-go/minimax-m2.7',
    temperature: 0.1,
  },
};

describe('save / load', () => {
  it('round-trips a config through YAML', () => {
    const file = path.join(tmp, '.agents-conf.yaml');
    save(file, sample);
    expect(load(file)).toEqual(sample);
  });

  it('creates parent directories on save', () => {
    const file = path.join(tmp, 'nested', 'deep', '.agents-conf.yaml');
    save(file, sample);
    expect(fs.existsSync(file)).toBe(true);
  });
});

describe('merge', () => {
  it('overrides matching keys and preserves the rest', () => {
    const local: Config = {
      'soia-explorer': {
        primary: 'opencode-go/kimi-k2.6',
        fallback: 'opencode-go/minimax-m2.7',
        temperature: 0.1,
      },
    };
    const merged = merge(sample, local);
    expect(merged['soia-explorer'].primary).toBe('opencode-go/kimi-k2.6');
    expect(merged['soia-orchestrator']).toEqual(sample['soia-orchestrator']);
  });

  it('does not mutate its inputs', () => {
    const before = JSON.parse(JSON.stringify(sample));
    merge(sample, { 'soia-explorer': { primary: 'x', fallback: 'y', temperature: 0 } });
    expect(sample).toEqual(before);
  });
});

describe('agentNames', () => {
  it('returns the configured agent keys', () => {
    expect(agentNames(sample)).toEqual(['soia-orchestrator', 'soia-explorer']);
  });
});

describe('fileExists', () => {
  it('reflects filesystem presence', () => {
    const file = path.join(tmp, 'x.yaml');
    expect(fileExists(file)).toBe(false);
    fs.writeFileSync(file, 'a: 1');
    expect(fileExists(file)).toBe(true);
  });
});

describe('soiaConfigDir / soiaConfigFile', () => {
  it('resolves under the user home dir (os.homedir())', () => {
    const home = os.homedir();
    expect(soiaConfigDir()).toBe(path.join(home, '.config', 'soia'));
    expect(soiaConfigFile()).toBe(path.join(home, '.config', 'soia', '.agents-conf.yaml'));
  });

  it('does not depend on the HOME env var (works on Windows)', () => {
    const original = process.env.HOME;
    try {
      delete process.env.HOME;
      expect(soiaConfigDir()).toBe(path.join(os.homedir(), '.config', 'soia'));
    } finally {
      if (original === undefined) delete process.env.HOME;
      else process.env.HOME = original;
    }
  });
});
