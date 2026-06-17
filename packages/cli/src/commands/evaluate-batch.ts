import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { log } from '@clack/prompts';
import { defineCommand } from 'citty';
import {
  parseCsvBatch,
  RiskProfilerEngine,
} from '@vibedcoder/invespro-core';
import {
  formatBatchCsv,
  inferBatchInputFormat,
  parseJsonBatch,
} from '../utils/batch.js';
import type { BatchInputFormat } from '../utils/batch.js';
import { loadDefinition } from '../utils/definition.js';
import { createFileSystemLoader } from '../utils/loader.js';

export default defineCommand({
  meta: {
    name: 'evaluate-batch',
    description: 'Evaluate multiple risk profiles from a JSON or CSV file',
  },
  args: {
    input: {
      type: 'string',
      description: 'Path to a JSON or CSV file containing applicant inputs',
      required: true,
    },
    'input-format': {
      type: 'string',
      description: 'Input format: json or csv. Defaults from file extension',
    },
    'jdm-path': {
      type: 'string',
      description: 'Path to a custom JDM graph file',
    },
    definition: {
      type: 'string',
      description: 'Path to a custom risk-profile definition',
    },
    output: {
      type: 'string',
      description: 'Output format: json (default) or csv',
      default: 'json',
    },
    'max-batch-size': {
      type: 'string',
      description: 'Maximum number of applicants accepted in one batch',
      default: '100',
    },
  },
  run: async ({ args }) => {
    let engine: RiskProfilerEngine | undefined;
    try {
      const outputFormat = resolveOutputFormat(args.output);
      const definition =
        args.definition !== undefined ? await loadDefinition(args.definition) : undefined;
      engine =
        args['jdm-path'] !== undefined
          ? new RiskProfilerEngine({
              ...(definition !== undefined && { definition }),
              loader: createFileSystemLoader(args['jdm-path']),
            })
          : new RiskProfilerEngine({
              ...(definition !== undefined && { definition }),
            });

      const raw = await readFile(resolve(process.cwd(), args.input), 'utf8');
      const inputFormat = resolveInputFormat(
        args['input-format'],
        args.input,
      );
      const maxBatchSize = Number(args['max-batch-size']);
      if (!Number.isInteger(maxBatchSize) || maxBatchSize < 1) {
        throw new Error('--max-batch-size must be a positive integer.');
      }

      const items =
        inputFormat === 'csv'
          ? parseCsvBatch(raw, engine.definition)
          : parseJsonBatch(JSON.parse(raw));

      const result = await engine.evaluateMany(
        {
          items,
        },
        {
          maxBatchSize,
        },
      );

      if (outputFormat === 'csv') {
        process.stdout.write(formatBatchCsv(result));
      } else {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      }
    } catch (err) {
      log.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    } finally {
      engine?.dispose();
    }
  },
});

function resolveInputFormat(
  requested: string | undefined,
  inputPath: string,
): BatchInputFormat {
  if (requested === undefined) return inferBatchInputFormat(inputPath);
  if (requested === 'json' || requested === 'csv') return requested;
  throw new Error('--input-format must be "json" or "csv".');
}

function resolveOutputFormat(requested: string): 'json' | 'csv' {
  if (requested === 'json' || requested === 'csv') return requested;
  throw new Error('--output must be "json" or "csv".');
}
