#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from '../lib/init';
import { runUpdate } from '../lib/update';
import { runFallback } from '../lib/fallback';
import { runModels } from '../lib/models';

const program = new Command();

program
  .name('swarm')
  .description('Swarm-Orchest-IA — Multi-Agent SDD Orchestrator CLI')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize Swarm-Orchest-IA in the current project')
  .option('--tool <tool>', 'Target tool (opencode, claude, cursor)', 'opencode')
  .action(async (opts) => {
    try {
      await runInit(opts.tool);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Update templates and re-inject model configuration')
  .option('--all', 'Update all projects with .swarm.yaml')
  .action((opts) => {
    try {
      runUpdate(opts.all || false);
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
  .action(async (agentName, opts) => {
    try {
      await runFallback(agentName, opts.all || false, opts.restore || false);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('models')
  .description('Show current model configuration for all agents')
  .option('--primary', 'Show only primary models')
  .option('--fallback', 'Show only fallback models')
  .action((opts) => {
    try {
      runModels(opts.primary || false, opts.fallback || false);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);