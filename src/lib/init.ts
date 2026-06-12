import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as agentsconf from '../lib/agentsconf';
import * as injector from '../lib/injector';
import * as fsutil from '../lib/fsutil';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

// Resolve templates directory relative to the package root
// In dev (ts-node): __dirname is src/lib, templates at ../../templates/opencode
// In prod (node dist): __dirname is dist/lib, templates at ../../templates/opencode
function getTemplatesDir(): string {
  const candidates = [
    path.join(__dirname, '..', '..', 'templates', 'opencode'),
    path.join(__dirname, '..', '..', 'src', 'templates', 'opencode'),
    path.join(process.cwd(), 'templates', 'opencode'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'agents'))) {
      return dir;
    }
  }
  throw new Error('Templates directory not found. Ensure templates/opencode/ exists.');
}
const TEMPLATES_DIR = getTemplatesDir();

const AGENT_ORDER = [
  'swarm-orchestrator',
  'swarm-explorer',
  'swarm-specifier',
  'swarm-designer',
  'swarm-implementer',
  'swarm-verifier',
];

export async function runInit(tool: string, projectDir: string, mode?: string): Promise<void> {
  const projectName = path.basename(projectDir);

  console.log(`Swarm-Orchest-IA — Project: ${projectName}\n`);

  agentsconf.ensureSwarmConfigDir();
  agentsconf.ensureSwarmTemplatesDir();

  const configFile = agentsconf.swarmConfigFile();
  let config: agentsconf.Config;

  if (!agentsconf.fileExists(configFile)) {
    console.log('No ~/.config/swarm/.agents-conf.yaml found.');
    console.log('Installing default configuration...');
    const defaultConf = fs.readFileSync(
      path.join(TEMPLATES_DIR, 'defaults', '.agents-conf.yaml'),
      'utf-8'
    );
    fs.writeFileSync(configFile, defaultConf, 'utf-8');
    console.log(`Created: ${configFile}\n`);
  }

  config = agentsconf.load(configFile);

  if (tool !== 'opencode') {
    throw new Error(`Tool '${tool}' is not supported yet. Currently only 'opencode' is available.`);
  }

  let modeValue: string;
  if (mode) {
    modeValue = mode;
    console.log(chalk.blue(`\nInstalling in ${modeValue} mode...\n`));
  } else {
    const { mode: selectedMode } = await inquirer.prompt<{ mode: string }>([{
      type: 'list',
      name: 'mode',
      message: 'Install mode:',
      choices: [
        { name: 'Global — symlinks to ~/.config/swarm/templates/, shared across projects', value: 'global' },
        { name: 'Local  — copies all files into the project, fully independent', value: 'local' },
      ],
      default: 'global',
    }]);
    modeValue = selectedMode;
    console.log();
  }

  const swarmDir = path.join(projectDir, '.swarm');
  const opencodeDir = path.join(projectDir, '.opencode');
  const swarmspecDir = path.join(projectDir, 'swarmspec');
  const home = os.homedir();

  // Step 2: .opencode/ with agents, skills, commands
  const agentsDir = path.join(opencodeDir, 'agents');
  const skillsDir = path.join(opencodeDir, 'skills');
  const commandsDir = path.join(opencodeDir, 'commands');

  if (modeValue === 'global') {
    const templatesPath = path.join(agentsconf.swarmConfigDir(), 'templates', 'opencode');
    const spinner = ora('Installing central templates...').start();

    installCentralTemplates(templatesPath);
    injectIntoCentralAgents(templatesPath, config);

    spinner.text = 'Creating symlinks...';
    fsutil.createSymlink(path.join(templatesPath, 'agents'), agentsDir);
    fsutil.createSymlink(path.join(templatesPath, 'skills'), skillsDir);
    fsutil.createSymlink(path.join(templatesPath, 'commands'), commandsDir);

    spinner.succeed(chalk.green('Installed in global mode — agents, skills, commands linked'));
  } else {
    const spinner = ora('Copying templates...').start();

    fsutil.ensureDir(agentsDir);
    fsutil.ensureDir(skillsDir);
    fsutil.ensureDir(commandsDir);

    copyAndInjectAgents(agentsDir, config);
    fsutil.copyDir(path.join(TEMPLATES_DIR, 'skills'), skillsDir);
    fsutil.copyDir(path.join(TEMPLATES_DIR, 'commands'), commandsDir);

    spinner.succeed(chalk.green('Installed in local mode — all files copied'));
  }

  // Step 4: .swarm/.agents-conf.yaml
  fsutil.ensureDir(swarmDir);
  const localConf = path.join(swarmDir, '.agents-conf.yaml');
  if (!agentsconf.fileExists(localConf)) {
    fs.writeFileSync(
      localConf,
      fs.readFileSync(path.join(TEMPLATES_DIR, 'defaults', 'local-agents-conf.yaml'), 'utf-8'),
      'utf-8'
    );
  }

  // Step 5-8: project files and metadata
  const spin = ora('Creating project files...').start();

  const agentsMd = generateAgentsMd(projectName, projectDir);
  fs.writeFileSync(path.join(projectDir, 'AGENTS.md'), agentsMd, 'utf-8');

  const openCodeJson = generateOpenCodeJson(projectName);
  fs.writeFileSync(path.join(projectDir, 'opencode.json'), openCodeJson, 'utf-8');

  fsutil.ensureDir(path.join(swarmspecDir, 'specs'));
  fsutil.ensureDir(path.join(swarmspecDir, 'changes', 'archive'));
  const exampleSpecDir = path.join(swarmspecDir, 'specs', 'hello-mundo');
  fsutil.ensureDir(exampleSpecDir);
  fs.writeFileSync(
    path.join(exampleSpecDir, 'spec.md'),
    fs.readFileSync(path.join(TEMPLATES_DIR, 'defaults', 'swarmspec-example', 'specs', 'hello-mundo', 'spec.md'), 'utf-8'),
    'utf-8'
  );

  const configContent = [
    `tool: ${tool}`,
    `mode: ${modeValue}`,
    `templates_path: ${home}/.config/swarm/templates/opencode`,
    `initialized_at: ${new Date().toISOString()}`,
  ].join('\n') + '\n';
  fs.writeFileSync(path.join(swarmDir, 'config.yaml'), configContent, 'utf-8');

  fs.writeFileSync(
    path.join(swarmDir, 'current.yaml'),
    fs.readFileSync(path.join(TEMPLATES_DIR, 'defaults', 'current.yaml'), 'utf-8'),
    'utf-8'
  );

  spin.succeed(chalk.green('Project files created'));

  console.log(chalk.green.bold('\nSwarm-Orchest-IA initialized successfully!'));
  console.log(`Mode: ${chalk.cyan(modeValue)} | Tool: ${chalk.cyan(tool)}`);
  console.log(chalk.dim('\nNext steps:'));
  console.log(chalk.dim('  1. Open this project in OpenCode'));
  console.log(chalk.dim('  2. Use /swarm-propose "your feature description" to start'));
}

function installCentralTemplates(templatesPath: string): void {
  const dirs: [string, string][] = [
    ['agents', path.join(templatesPath, 'agents')],
    ['skills/swarm-format', path.join(templatesPath, 'skills', 'swarm-format')],
    ['skills/swarm-delta', path.join(templatesPath, 'skills', 'swarm-delta')],
    ['skills/swarm-archive', path.join(templatesPath, 'skills', 'swarm-archive')],
    ['commands', path.join(templatesPath, 'commands')],
  ];

  for (const [srcRel, dstDir] of dirs) {
    const srcDir = path.join(TEMPLATES_DIR, srcRel);
    fsutil.copyDir(srcDir, dstDir);
  }
}

function injectIntoCentralAgents(templatesPath: string, config: agentsconf.Config): void {
  const agentsPath = path.join(templatesPath, 'agents');
  if (!fs.existsSync(agentsPath)) return;

  for (const entry of fs.readdirSync(agentsPath)) {
    if (!injector.isSwarmAgent(entry)) continue;

    const filePath = path.join(agentsPath, entry);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (!injector.needsInjection(content)) continue;

    const agentName = injector.agentNameFromFilename(entry);
    content = injector.injectIntoAgent(content, agentName, config);
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

function copyAndInjectAgents(agentsDir: string, config: agentsconf.Config): void {
  const srcDir = path.join(TEMPLATES_DIR, 'agents');

  for (const entry of fs.readdirSync(srcDir)) {
    if (!injector.isSwarmAgent(entry)) continue;

    const srcPath = path.join(srcDir, entry);
    const dstPath = path.join(agentsDir, entry);
    let content = fs.readFileSync(srcPath, 'utf-8');

    if (injector.needsInjection(content)) {
      const agentName = injector.agentNameFromFilename(entry);
      content = injector.injectIntoAgent(content, agentName, config);
    }

    fs.writeFileSync(dstPath, content, 'utf-8');
  }
}

function generateAgentsMd(projectName: string, cwd: string): string {
  let content = fs.readFileSync(path.join(TEMPLATES_DIR, 'defaults', 'AGENTS.md'), 'utf-8');
  content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
  content = content.replace(/\{\{STACK_RUNTIME\}\}/g, detectRuntime(cwd));
  content = content.replace(/\{\{STACK_FRAMEWORK\}\}/g, detectFramework(cwd));
  content = content.replace(/\{\{STACK_LANGUAGE\}\}/g, detectLanguage(cwd));
  content = content.replace(/\{\{PROJECT_STRUCTURE\}\}/g, 'Auto-detected from project');
  content = content.replace(/\{\{NAMING_CONVENTION\}\}/g, 'Follow existing project conventions');
  content = content.replace(/\{\{ARCHITECTURE_PATTERN\}\}/g, 'Follow existing project patterns');
  content = content.replace(/\{\{VALIDATION_LIBRARY\}\}/g, 'Follow existing project conventions');
  content = content.replace(/\{\{ORM\}\}/g, 'Follow existing project conventions');
  content = content.replace(/\{\{TEST_FRAMEWORK\}\}/g, 'Follow existing project conventions');
  return content;
}

function generateOpenCodeJson(projectName: string): string {
  let content = fs.readFileSync(path.join(TEMPLATES_DIR, 'defaults', 'opencode.json'), 'utf-8');
  content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
  return content;
}

function detectRuntime(cwd: string): string {
  if (fs.existsSync(path.join(cwd, '*.csproj')) || fs.existsSync(path.join(cwd, 'Program.cs'))) return '.NET';
  if (fs.existsSync(path.join(cwd, 'package.json'))) return 'Node.js';
  return 'Auto-detect';
}

function detectFramework(cwd: string): string {
  if (fs.existsSync(path.join(cwd, 'Program.cs'))) return 'ASP.NET Core';
  if (fs.existsSync(path.join(cwd, 'package.json'))) return 'Node.js';
  return 'Auto-detect';
}

function detectLanguage(cwd: string): string {
  if (fs.existsSync(path.join(cwd, 'Program.cs'))) return 'C#';
  if (fs.existsSync(path.join(cwd, 'package.json'))) return 'TypeScript/JavaScript';
  return 'Auto-detect';
}