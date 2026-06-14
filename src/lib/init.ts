import * as fs from 'fs';
import * as path from 'path';
import * as agentsconf from './agentsconf';
import * as fsutil from './fsutil';
import * as adapters from './adapters';
import { renderProject, getTemplatesDir } from './render';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

const TEMPLATES_DIR = getTemplatesDir();

export async function runInit(tool: string, projectDir: string, mode?: string): Promise<void> {
  const projectName = path.basename(projectDir);

  console.log(`Swarm-Orchest-IA — Project: ${projectName}\n`);

  agentsconf.ensureSoiaConfigDir();

  // Install the default global model config if missing.
  const configFile = agentsconf.soiaConfigFile();
  if (!agentsconf.fileExists(configFile)) {
    console.log('No ~/.config/soia/.agents-conf.yaml found.');
    console.log('Installing default configuration...');
    fs.writeFileSync(
      configFile,
      fs.readFileSync(path.join(TEMPLATES_DIR, 'defaults', '.agents-conf.yaml'), 'utf-8'),
      'utf-8'
    );
    console.log(`Created: ${configFile}\n`);
  }

  // Resolve the adapter early — clear error for unsupported tools.
  if (!adapters.registry.has(tool)) {
    const known = adapters.registry.getAll().map((a) => a.toolId).join(', ') || '(none)';
    throw new Error(`Tool '${tool}' is not supported. Available adapters: ${known}.`);
  }

  const config = agentsconf.load(configFile);

  // Install mode (global = tool's global config; local = inside the project).
  let modeValue: string;
  if (mode) {
    modeValue = mode;
    console.log(chalk.blue(`\nInstalling in ${modeValue} mode...\n`));
  } else {
    const { mode: selectedMode } = await inquirer.prompt<{ mode: string }>([
      {
        type: 'list',
        name: 'mode',
        message: 'Install mode:',
        choices: [
          { name: "Global — render into the tool's global config (shared across projects)", value: 'global' },
          { name: 'Local  — render into the project (committed, self-contained)', value: 'local' },
        ],
        default: 'local',
      },
    ]);
    modeValue = selectedMode;
    console.log();
  }

  const soiaDir = path.join(projectDir, '.soia');
  const soiaSpecDir = path.join(projectDir, 'soia-spec');

  // Render agents/skills/commands/context/config via the adapter — no symlinks.
  const spinner = ora('Rendering templates...').start();
  renderProject(tool, projectDir, modeValue, config);
  spinner.succeed(chalk.green(`Rendered for ${tool} (${modeValue} mode)`));

  const spin = ora('Creating project files...').start();

  // Local model override + soia metadata.
  fsutil.ensureDir(soiaDir);
  const localConf = path.join(soiaDir, '.agents-conf.yaml');
  if (!agentsconf.fileExists(localConf)) {
    fs.writeFileSync(
      localConf,
      fs.readFileSync(path.join(TEMPLATES_DIR, 'defaults', 'local-agents-conf.yaml'), 'utf-8'),
      'utf-8'
    );
  }

  // soia-spec scaffold with the example spec.
  fsutil.ensureDir(path.join(soiaSpecDir, 'specs'));
  fsutil.ensureDir(path.join(soiaSpecDir, 'changes', 'archive'));
  const exampleSpecDir = path.join(soiaSpecDir, 'specs', 'hello-mundo');
  fsutil.ensureDir(exampleSpecDir);
  fs.writeFileSync(
    path.join(exampleSpecDir, 'spec.md'),
    fs.readFileSync(
      path.join(TEMPLATES_DIR, 'defaults', 'soia-spec-example', 'specs', 'hello-mundo', 'spec.md'),
      'utf-8'
    ),
    'utf-8'
  );

  const configContent =
    [`tool: ${tool}`, `mode: ${modeValue}`, `initialized_at: ${new Date().toISOString()}`].join('\n') + '\n';
  fs.writeFileSync(path.join(soiaDir, 'config.yaml'), configContent, 'utf-8');

  fs.writeFileSync(
    path.join(soiaDir, 'current.yaml'),
    fs.readFileSync(path.join(TEMPLATES_DIR, 'defaults', 'current.yaml'), 'utf-8'),
    'utf-8'
  );

  spin.succeed(chalk.green('Project files created'));

  console.log(chalk.green.bold('\nSwarm-Orchest-IA initialized successfully!'));
  console.log(`Mode: ${chalk.cyan(modeValue)} | Tool: ${chalk.cyan(tool)}`);
  console.log(chalk.dim('\nNext steps:'));
  console.log(chalk.dim('  1. Open this project in your AI tool'));
  console.log(chalk.dim('  2. Use /soia-propose "your feature description" to start'));
}
