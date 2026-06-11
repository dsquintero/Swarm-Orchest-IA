import * as fs from 'fs';
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

export function swarmConfigDir(): string {
  return path.join(process.env.HOME || '/root', '.config', 'swarm');
}

export function swarmConfigFile(): string {
  return path.join(swarmConfigDir(), '.agents-conf.yaml');
}

export function ensureSwarmConfigDir(): void {
  const dir = swarmConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function ensureSwarmTemplatesDir(): void {
  const dir = path.join(swarmConfigDir(), 'templates', 'opencode');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}