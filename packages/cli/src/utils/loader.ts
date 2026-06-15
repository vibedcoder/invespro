import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { JdmGraphLoader } from '@vibedcoder/invespro-core';
import { DEFAULT_GRAPH_KEY } from '@vibedcoder/invespro-core';

/**
 * Creates a loader that reads a JDM graph from the file system.
 * Used when --jdm-path is passed to override the bundled default.
 */
export function createFileSystemLoader(jdmPath: string): JdmGraphLoader {
  const absolutePath = resolve(process.cwd(), jdmPath);

  return async (key: string): Promise<Buffer> => {
    if (key !== DEFAULT_GRAPH_KEY) {
      throw new Error(`[invespro-cli] Unknown graph key: "${key}"`);
    }
    const content = await readFile(absolutePath, 'utf-8');
    return Buffer.from(content);
  };
}