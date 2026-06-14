import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Artifact, StackInfo } from './types';

/** Split a markdown file into its YAML frontmatter (meta) and body. */
export function parseFrontmatter(content: string): { meta: Record<string, any>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(content);
  if (!m) return { meta: {}, body: content };
  const meta = (yaml.load(m[1]) as Record<string, any>) || {};
  return { meta, body: m[2] };
}

/** Detect the target project's stack for context placeholders. */
export function detectStack(projectDir: string): StackInfo {
  const has = (f: string) => fs.existsSync(path.join(projectDir, f));
  if (has('Program.cs')) {
    return { runtime: '.NET', framework: 'ASP.NET Core', language: 'C#' };
  }
  if (has('package.json')) {
    return { runtime: 'Node.js', framework: 'Node.js', language: 'TypeScript/JavaScript' };
  }
  return { runtime: 'Auto-detect', framework: 'Auto-detect', language: 'Auto-detect' };
}

/**
 * Resolve tool-neutral project placeholders. Applied by every adapter the
 * same way (the values come from the project, not the tool).
 */
export function resolveProjectPlaceholders(
  text: string,
  ctx: { projectName: string; stack: StackInfo }
): string {
  return text
    .replace(/\{\{PROJECT_NAME\}\}/g, ctx.projectName)
    .replace(/\{\{STACK_RUNTIME\}\}/g, ctx.stack.runtime)
    .replace(/\{\{STACK_FRAMEWORK\}\}/g, ctx.stack.framework)
    .replace(/\{\{STACK_LANGUAGE\}\}/g, ctx.stack.language)
    .replace(/\{\{PROJECT_STRUCTURE\}\}/g, 'Auto-detected from project')
    .replace(/\{\{NAMING_CONVENTION\}\}/g, 'Follow existing project conventions')
    .replace(/\{\{ARCHITECTURE_PATTERN\}\}/g, 'Follow existing project patterns')
    .replace(/\{\{VALIDATION_LIBRARY\}\}/g, 'Follow existing project conventions')
    .replace(/\{\{ORM\}\}/g, 'Follow existing project conventions')
    .replace(/\{\{TEST_FRAMEWORK\}\}/g, 'Follow existing project conventions');
}

/** Load all tool-agnostic artifacts from the canonical templates directory. */
export function loadCanonical(templatesDir: string): Artifact[] {
  const out: Artifact[] = [];

  const readMd = (dir: string, kind: 'agent' | 'command') => {
    const full = path.join(templatesDir, dir);
    if (!fs.existsSync(full)) return;
    for (const f of fs.readdirSync(full)) {
      if (!f.endsWith('.md')) continue;
      const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(full, f), 'utf-8'));
      out.push({ kind, id: f.replace(/\.md$/, ''), meta, body });
    }
  };

  readMd('agents', 'agent');
  readMd('commands', 'command');

  const skillsDir = path.join(templatesDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const d of fs.readdirSync(skillsDir)) {
      const skillFile = path.join(skillsDir, d, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        out.push({ kind: 'skill', id: d, meta: {}, body: fs.readFileSync(skillFile, 'utf-8') });
      }
    }
  }

  const contextFile = path.join(templatesDir, 'context', 'AGENTS.md');
  if (fs.existsSync(contextFile)) {
    out.push({ kind: 'context', id: 'AGENTS', meta: {}, body: fs.readFileSync(contextFile, 'utf-8') });
  }

  return out;
}
