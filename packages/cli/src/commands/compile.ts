import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineCommand } from 'citty';
import { compileRiskProfileDefinition } from '@zagvar/helm-core';
import { loadDefinition } from '../utils/definition.js';

export default defineCommand({
  meta: {
    name: 'compile',
    description: 'Compile a risk-profile definition into a JDM graph',
  },
  args: {
    definition: {
      type: 'string',
      description: 'Path to the risk-profile definition',
      required: true,
    },
    output: {
      type: 'string',
      description: 'Optional output path; defaults to standard output',
    },
  },
  run: async ({ args }) => {
    const definition = await loadDefinition(args.definition);
    const compiled = compileRiskProfileDefinition(definition);
    const content = `${JSON.stringify(compiled.graph, null, 2)}\n`;

    if (args.output === undefined) {
      process.stdout.write(content);
      return;
    }
    await writeFile(resolve(process.cwd(), args.output), content, 'utf8');
    process.stderr.write(
      `Compiled ${definition.id}@${definition.version} (${compiled.graphChecksum})\n`,
    );
  },
});
