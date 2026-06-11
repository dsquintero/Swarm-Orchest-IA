import * as fs from 'fs';
import * as path from 'path';
import * as agentsconf from './agentsconf';
import * as injector from './injector';
import * as fsutil from './fsutil';

export async function runFallback(agentName?: string, all: boolean = false, restore: boolean = false, projectDir: string = process.cwd()): Promise<void> {
  const configFile = agentsconf.swarmConfigFile();
  const config = agentsconf.load(configFile);

  const configPath = path.join(projectDir, '.swarm', 'config.yaml');

  if (!fs.existsSync(configPath)) {
    throw new Error('No .swarm/config.yaml found. Run "swarm init" first.');
  }

  let mode = 'local';
  const content = fs.readFileSync(configPath, 'utf-8');
  if (content.includes('mode: global')) mode = 'global';

  if (restore) {
    return restorePrimary(config, projectDir, mode);
  }

  if (all) {
    return switchAllToFallback(config, projectDir, mode);
  }

  if (agentName) {
    return switchAgentToFallback(config, projectDir, mode, agentName);
  }

  console.log('Specify an agent name or use --all. Available agents:');
  for (const [name, ac] of Object.entries(config)) {
    console.log(`  ${name.padEnd(20)} primary: ${ac.primary.padEnd(25)} fallback: ${ac.fallback}`);
  }
}

async function switchAllToFallback(config: agentsconf.Config, projectDir: string, mode: string): Promise<void> {
  const localOverride: agentsconf.Config = {};

  for (const [name, ac] of Object.entries(config)) {
    localOverride[name] = {
      primary: ac.fallback,
      fallback: ac.primary,
      temperature: ac.temperature,
    };
  }

  writeLocalOverride(projectDir, localOverride as agentsconf.Config);
  await reinject(projectDir, mode, { ...config, ...localOverride } as agentsconf.Config);
}

async function switchAgentToFallback(globalCfg: agentsconf.Config, projectDir: string, mode: string, agentName: string): Promise<void> {
  const agentCfg = globalCfg[agentName];
  if (!agentCfg) {
    throw new Error(`Agent '${agentName}' not found in configuration.`);
  }

  const localOverride: Record<string, { primary: string; fallback?: string; temperature: number }> = {
    [agentName]: {
      primary: agentCfg.fallback,
      fallback: agentCfg.primary,
      temperature: agentCfg.temperature,
    },
  };

  writeLocalOverride(projectDir, localOverride as any as agentsconf.Config);
  const merged = agentsconf.merge(globalCfg, localOverride as any as agentsconf.Config);
  await reinject(projectDir, mode, merged);
}

async function restorePrimary(globalCfg: agentsconf.Config, projectDir: string, mode: string): Promise<void> {
  const localConf = path.join(projectDir, '.swarm', '.agents-conf.yaml');
  if (fs.existsSync(localConf)) {
    fs.unlinkSync(localConf);
    console.log('Removed local override. Using primary models from global config.');
  } else {
    console.log('No local override found. Already using primary models.');
  }

  await reinject(projectDir, mode, globalCfg);
}

function writeLocalOverride(projectDir: string, override: agentsconf.Config): void {
  const swarmDir = path.join(projectDir, '.swarm');
  fsutil.ensureDir(swarmDir);

  const localConf = path.join(swarmDir, '.agents-conf.yaml');
  let existing: agentsconf.Config = {};
  if (fs.existsSync(localConf)) {
    existing = agentsconf.load(localConf);
  }

  const merged = agentsconf.merge(existing, override);
  agentsconf.save(localConf, merged);
}

async function reinject(projectDir: string, mode: string, config: agentsconf.Config): Promise<void> {
  let agentsDir: string;
  if (mode === 'global') {
    agentsDir = path.join(agentsconf.swarmConfigDir(), 'templates', 'opencode', 'agents');
  } else {
    agentsDir = path.join(projectDir, '.opencode', 'agents');
  }

  if (!fs.existsSync(agentsDir)) return;

  for (const entry of fs.readdirSync(agentsDir)) {
    if (entry.startsWith('swarm-') && entry.endsWith('.md')) {
      const filePath = path.join(agentsDir, entry);
      let content = fs.readFileSync(filePath, 'utf-8');
      const agentName = entry.replace(/\.md$/, '');
      const agentCfg = config[agentName];
      if (!agentCfg) continue;

      content = injector.injectInto(content, agentCfg.primary, agentCfg.temperature);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  Updated: ${entry} (model: ${agentCfg.primary})`);
    }
  }

  console.log('Fallback applied successfully.');
}