import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as agentsconf from './agentsconf';
import { renderProject } from './render';

export function runUpdate(updateAll: boolean = false, projectDir?: string): void {
  const globalConfig = agentsconf.load(agentsconf.soiaConfigFile());

  if (updateAll) {
    updateAllProjects(globalConfig);
  } else {
    updateCurrentProject(globalConfig, projectDir || process.cwd());
  }
}

function updateCurrentProject(globalConfig: agentsconf.Config, projectDir: string): void {
  const configPath = path.join(projectDir, '.soia', 'config.yaml');

  if (!fs.existsSync(configPath)) {
    throw new Error('No .soia/config.yaml found in project directory. Run "soia init" first.');
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  const mode = content.includes('mode: global') ? 'global' : 'local';
  const toolMatch = content.match(/tool:\s*(\S+)/);
  const tool = toolMatch ? toolMatch[1] : 'opencode';

  // Merge the global model config with the project's local override.
  const localPath = path.join(projectDir, '.soia', '.agents-conf.yaml');
  const local = fs.existsSync(localPath) ? agentsconf.load(localPath) : {};
  const config = agentsconf.merge(globalConfig, local);

  console.log(`Updating project (tool: ${tool}, mode: ${mode})...`);
  renderProject(tool, projectDir, mode, config);
  console.log('Update complete.');
}

function updateAllProjects(globalConfig: agentsconf.Config): void {
  const home = os.homedir();
  console.log('Searching for projects with .soia/config.yaml...');

  const projects = findSoiaProjects(home);

  if (projects.length === 0) {
    console.log('No projects found with .soia/config.yaml');
    return;
  }

  for (const proj of projects) {
    console.log(`\nUpdating ${proj}...`);
    try {
      updateCurrentProject(globalConfig, proj);
    } catch (err: any) {
      console.log(`  Error: ${err.message}`);
    }
  }
}

function findSoiaProjects(dir: string, depth: number = 0): string[] {
  if (depth > 5) return [];
  const results: string[] = [];

  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name === '.soia' && entry.isDirectory()) {
        const configFile = path.join(fullPath, 'config.yaml');
        if (fs.existsSync(configFile)) {
          const parentDir = path.dirname(fullPath);
          if (!parentDir.includes('.config')) {
            results.push(parentDir);
          }
        }
      }
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        results.push(...findSoiaProjects(fullPath, depth + 1));
      }
    }
  } catch {
    // Permission denied, skip
  }

  return results;
}
