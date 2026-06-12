import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface AgentConfig {
  primary: string;
  fallback: string;
  temperature: number;
}

export type Config = Record<string, AgentConfig>;

export function load(filePath: string): Config {
  const data = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(data) as Config;
}

export function save(filePath: string, config: Config): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, yaml.dump(config, { lineWidth: -1 }), 'utf-8');
}

export function merge(global: Config, local: Config): Config {
  return { ...global, ...local };
}

export function agentNames(config: Config): string[] {
  return Object.keys(config);
}

export function soiaConfigDir(): string {
  return path.join(os.homedir(), '.config', 'soia');
}

export function soiaConfigFile(): string {
  return path.join(soiaConfigDir(), '.agents-conf.yaml');
}

export function ensureSoiaConfigDir(): void {
  const dir = soiaConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function ensureSoiaTemplatesDir(): void {
  const dir = path.join(soiaConfigDir(), 'templates', 'opencode');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}