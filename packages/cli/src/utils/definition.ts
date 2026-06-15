import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { RiskProfileDefinitionSchema } from '@vibedcoder/invespro-types';
import type { RiskProfileDefinition } from '@vibedcoder/invespro-types';

/** Loads and validates a risk-profile definition from the filesystem. */
export async function loadDefinition(
  definitionPath: string,
): Promise<RiskProfileDefinition> {
  const content = await readFile(resolve(process.cwd(), definitionPath), 'utf8');
  return RiskProfileDefinitionSchema.parse(JSON.parse(content));
}
