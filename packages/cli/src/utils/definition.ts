import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { RiskProfileDefinitionSchema } from '@zagvar/helm-types';
import type { RiskProfileDefinition } from '@zagvar/helm-types';

/** Loads and validates a risk-profile definition from the filesystem. */
export async function loadDefinition(
  definitionPath: string,
): Promise<RiskProfileDefinition> {
  const content = await readFile(resolve(process.cwd(), definitionPath), 'utf8');
  return RiskProfileDefinitionSchema.parse(JSON.parse(content));
}
