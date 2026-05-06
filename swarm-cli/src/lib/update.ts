import * as fs from 'fs';
import * as path from 'path';
import * as agentsconf from './agentsconf';
import * as injector from './injector';

export function runUpdate(updateAll: boolean = false): void {
  const configFile = agentsconf.swarmConfigFile();
  const config = agentsconf.load(configFile);

  if (updateAll) {
    updateAllProjects(config);
  } else {
    updateCurrentProject(config);
  }
}

function updateCurrentProject(config: agentsconf.Config): void {
  const cwd = process.cwd();
  const swarmYaml = path.join(cwd, '.swarm.yaml');

  if (!fs.existsSync(swarmYaml)) {
    throw new Error('No .swarm.yaml found in current directory. Run "swarm init" first.');
  }

  const configPath = path.join(cwd, '.swarm', 'config.yaml');
  let mode = 'local';
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    if (content.includes('mode: global')) mode = 'global';
  }

  console.log(`Updating project (mode: ${mode})...`);

  const agentsDir = path.join(cwd, '.opencode', 'agents');

  if (mode === 'global') {
    const templatesPath = path.join(agentsconf.swarmConfigDir(), 'templates', 'opencode');
    injectIntoAgents(path.join(templatesPath, 'agents'), config);
    console.log('Re-injected model/temperature into central templates');
  } else {
    injectIntoAgents(agentsDir, config);
    console.log('Re-injected model/temperature into local agents');
  }

  console.log('Update complete.');
}

function injectIntoAgents(agentsDir: string, config: agentsconf.Config): void {
  if (!fs.existsSync(agentsDir)) return;

  for (const entry of fs.readdirSync(agentsDir)) {
    if (!injector.isSwarmAgent(entry)) continue;

    const filePath = path.join(agentsDir, entry);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (!injector.needsInjection(content)) continue;

    const agentName = injector.agentNameFromFilename(entry);
    content = injector.injectIntoAgent(content, agentName, config);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  Updated: ${entry}`);
  }
}

function updateAllProjects(config: agentsconf.Config): void {
  const home = process.env.HOME || '/root';
  console.log('Searching for projects with .swarm.yaml...');

  const projects = findProjectsWithSwarmYaml(home);

  if (projects.length === 0) {
    console.log('No projects found with .swarm.yaml');
    return;
  }

  for (const proj of projects) {
    console.log(`\nUpdating ${proj}...`);
    process.chdir(proj);
    try {
      updateCurrentProject(config);
    } catch (err: any) {
      console.log(`  Error: ${err.message}`);
    }
  }
}

function findProjectsWithSwarmYaml(dir: string, depth: number = 0): string[] {
  if (depth > 5) return [];
  const results: string[] = [];

  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name === '.swarm.yaml') {
        const parentDir = path.dirname(fullPath);
        if (!parentDir.includes('.config')) {
          results.push(parentDir);
        }
      }
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        results.push(...findProjectsWithSwarmYaml(fullPath, depth + 1));
      }
    }
  } catch {
    // Permission denied, skip
  }

  return results;
}