import * as registry from './registry';
import { opencodeAdapter } from './opencode';

// Register built-in adapters.
registry.register(opencodeAdapter);

export * from './types';
export { opencodeAdapter };
export { registry };
export { loadCanonical, detectStack, parseFrontmatter, resolveProjectPlaceholders } from './canonical';
