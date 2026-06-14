import * as agentsconf from '../agentsconf';

/** Kind of artifact rendered into a tool's native layout. */
export type ArtifactKind = 'agent' | 'skill' | 'command' | 'context' | 'config';

/** Where the rendered artifact is written. */
export type Scope = 'project' | 'global';

/** Detected stack info for the target project (used to resolve context placeholders). */
export interface StackInfo {
  runtime: string;
  framework: string;
  language: string;
}

/**
 * A tool-agnostic artifact loaded from the canonical source (or synthesized,
 * e.g. the tool config). Adapters turn this into a native file.
 */
export interface Artifact {
  kind: ArtifactKind;
  /** Identifier, e.g. 'soia-orchestrator', 'soia-format', 'AGENTS', 'config'. */
  id: string;
  /** Parsed neutral frontmatter (empty for raw artifacts like skills/context). */
  meta: Record<string, any>;
  /** Markdown/text body (for skills/context this is the full file content). */
  body: string;
}

/** Everything an adapter needs to render an artifact for a concrete project. */
export interface RenderContext {
  config: agentsconf.Config;
  projectDir: string;
  projectName: string;
  stack: StackInfo;
}

/**
 * Per-tool strategy: where each artifact goes and how it is rendered.
 * Adding a tool = implementing this interface and registering it.
 */
export interface ToolAdapter {
  /** Tool id, e.g. 'opencode', 'claude'. */
  toolId: string;
  /** Absolute native path for the artifact at the given scope. */
  getFilePath(artifact: Artifact, scope: Scope, projectDir: string): string;
  /** Native file content, or null if this adapter does not emit this artifact. */
  render(artifact: Artifact, ctx: RenderContext): string | null;
}
