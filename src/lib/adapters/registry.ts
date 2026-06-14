import { ToolAdapter } from './types';

/**
 * Registry of tool adapters keyed by tool id. New tools are added by
 * registering an adapter, without touching init's control flow.
 */
const adapters = new Map<string, ToolAdapter>();

export function register(adapter: ToolAdapter): void {
  adapters.set(adapter.toolId, adapter);
}

export function get(toolId: string): ToolAdapter | undefined {
  return adapters.get(toolId);
}

export function getAll(): ToolAdapter[] {
  return Array.from(adapters.values());
}

export function has(toolId: string): boolean {
  return adapters.has(toolId);
}
