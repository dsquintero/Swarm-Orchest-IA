import * as fs from 'fs';
import * as path from 'path';
import * as agentsconf from './agentsconf';

const AGENT_ORDER = [
  'soia-orchestrator',
  'soia-explorer',
  'soia-specifier',
  'soia-designer',
  'soia-implementer',
  'soia-verifier',
];

export function runModels(primaryOnly: boolean = false, fallbackOnly: boolean = false, projectDir: string = process.cwd()): void {
  const configFile = agentsconf.soiaConfigFile();
  const config = agentsconf.load(configFile);

  const localConf = path.join(projectDir, '.soia', '.agents-conf.yaml');
  let effectiveConfig = config;

  if (fs.existsSync(localConf)) {
    const localCfg = agentsconf.load(localConf);
    effectiveConfig = agentsconf.merge(config, localCfg);
  }

  console.log();

  if (primaryOnly) {
    console.log(`${'AGENT'.padEnd(20)} ${'PRIMARY MODEL'}`);
    console.log('-'.repeat(50));
    for (const name of AGENT_ORDER) {
      const ac = effectiveConfig[name];
      if (ac) console.log(`${name.padEnd(20)} ${ac.primary}`);
    }
  } else if (fallbackOnly) {
    console.log(`${'AGENT'.padEnd(20)} ${'FALLBACK MODEL'}`);
    console.log('-'.repeat(50));
    for (const name of AGENT_ORDER) {
      const ac = effectiveConfig[name];
      if (ac) console.log(`${name.padEnd(20)} ${ac.fallback}`);
    }
  } else {
    console.log(`${'AGENT'.padEnd(20)} ${'PRIMARY'.padEnd(25)} ${'FALLBACK'.padEnd(25)} TEMP`);
    console.log('-'.repeat(80));
    for (const name of AGENT_ORDER) {
      const ac = effectiveConfig[name];
      if (ac) {
        console.log(`${name.padEnd(20)} ${ac.primary.padEnd(25)} ${ac.fallback.padEnd(25)} ${ac.temperature}`);
      }
    }
  }

  if (fs.existsSync(localConf)) {
    console.log('\n(local override active: .soia/.agents-conf.yaml)');
  }

  console.log();
}