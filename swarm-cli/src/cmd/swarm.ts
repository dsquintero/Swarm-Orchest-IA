#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from '../lib/init';
import { runUpdate } from '../lib/update';
import { runFallback } from '../lib/fallback';
import { runModels } from '../lib/models';
import { resolveProjectDir, isInitialized } from '../lib/fsutil';

const program = new Command();

program
  .name('swarm')
  .description('Swarm-Orchest-IA — Multi-Agent SDD Orchestrator CLI')
  .version('0.1.0');

program
  .command('init [path]')
  .description('Initialize Swarm-Orchest-IA in a project directory')
  .option('--tool <tool>', 'Target tool (opencode, claude, cursor)', 'opencode')
  .action(async (projectPath, opts) => {
    try {
      const projectDir = resolveProjectDir(projectPath);
      if (isInitialized(projectDir)) {
        throw new Error(`Project already initialized. Found .swarm.yaml in ${projectDir}.\nUse 'swarm update' to update.`);
      }
      await runInit(opts.tool, projectDir);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('update [path]')
  .description('Update templates and re-inject model configuration')
  .option('--all', 'Update all projects with .swarm.yaml')
  .action((projectPath, opts) => {
    try {
      if (opts.all) {
        runUpdate(true);
      } else {
        const projectDir = resolveProjectDir(projectPath);
        if (!isInitialized(projectDir)) {
          throw new Error(`Not a Swarm project. Run 'swarm init' first.`);
        }
        runUpdate(false, projectDir);
      }
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('fallback [agent-name]')
  .description('Switch agents to fallback models or restore primary models')
  .option('--all', 'Switch all agents to fallback')
  .option('--restore', 'Restore all agents to primary models')
  .option('--path <path>', 'Project directory')
  .action(async (agentName, opts) => {
    try {
      const projectDir = resolveProjectDir(opts.path);
      if (!isInitialized(projectDir)) {
        throw new Error(`Not a Swarm project. Run 'swarm init' first.`);
      }
      await runFallback(agentName, opts.all || false, opts.restore || false, projectDir);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('models [path]')
  .description('Show current model configuration for all agents')
  .option('--primary', 'Show only primary models')
  .option('--fallback', 'Show only fallback models')
  .action((projectPath, opts) => {
    try {
      const projectDir = resolveProjectDir(projectPath);
      if (!isInitialized(projectDir)) {
        throw new Error(`Not a Swarm project. Run 'swarm init' first.`);
      }
      runModels(opts.primary || false, opts.fallback || false, projectDir);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);