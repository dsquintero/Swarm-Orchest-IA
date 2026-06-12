import * as agentsconf from './agentsconf';

const INJECT_COMMENT = '# model y temperature se inyectan desde ~/.config/soia/.agents-conf.yaml';

export function injectIntoAgent(
  content: string,
  agentName: string,
  config: agentsconf.Config
): string {
  const agentCfg = config[agentName];
  if (!agentCfg) return content;

  const lines = content.split('\n');
  let inFrontmatter = false;
  let injectLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (i === 0 && trimmed === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter && trimmed === '---') break;
    if (inFrontmatter && trimmed === INJECT_COMMENT) {
      injectLine = i;
    }
  }

  if (injectLine === -1) return content;

  const newLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === injectLine) {
      newLines.push(`model: ${agentCfg.primary}`);
      newLines.push(`temperature: ${agentCfg.temperature}`);
    } else {
      newLines.push(lines[i]);
    }
  }

  return newLines.join('\n');
}

export function injectInto(content: string, model: string, temperature: number): string {
  const lines = content.split('\n');
  let inFrontmatter = false;
  let injectLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (i === 0 && trimmed === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter && trimmed === '---') break;
    if (inFrontmatter && (trimmed === INJECT_COMMENT || trimmed.startsWith('model:'))) {
      if (injectLine === -1) injectLine = i;
    }
  }

  if (injectLine === -1) return content;

  const newLines: string[] = [];
  let skippedTemp = false;
  for (let i = 0; i < lines.length; i++) {
    if (i === injectLine) {
      newLines.push(`model: ${model}`);
      newLines.push(`temperature: ${temperature}`);
      skippedTemp = false;
    } else if (i === injectLine + 1 && lines[i].trim().startsWith('temperature:')) {
      continue;
    } else {
      newLines.push(lines[i]);
    }
  }

  return newLines.join('\n');
}

export function isSoiaAgent(filename: string): boolean {
  return filename.startsWith('soia-') && filename.endsWith('.md');
}

export function agentNameFromFilename(filename: string): string {
  return filename.replace(/\.md$/, '');
}

export function needsInjection(content: string): boolean {
  return content.includes(INJECT_COMMENT);
}