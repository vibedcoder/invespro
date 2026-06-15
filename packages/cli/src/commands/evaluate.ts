import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { intro, log, note, outro, spinner } from '@clack/prompts';
import { defineCommand } from 'citty';
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { ApplicantInputSchema } from '@vibedcoder/invespro-types';
import { formatResult } from '../utils/format.js';
import { createFileSystemLoader } from '../utils/loader.js';

export default defineCommand({
  meta: {
    name: 'evaluate',
    description: 'Evaluate risk profile from a JSON input file',
  },
  args: {
    input: {
      type: 'string',
      description: 'Path to JSON file containing applicant input',
      required: true,
    },
    'jdm-path': {
      type: 'string',
      description: 'Path to a custom JDM graph file',
    },
    output: {
      type: 'string',
      description: 'Output format: table (default) or json',
      default: 'table',
    },
  },
  run: async ({ args }) => {
    const jsonOutput = args.output === 'json';
    if (!jsonOutput) {
      intro('Investment Risk Profiling - Evaluate');
    }

    const s = spinner();
    if (!jsonOutput) {
      s.start('Reading input file...');
    }

    let engine: RiskProfilerEngine | undefined;
    try {
      const raw = await readFile(resolve(process.cwd(), args.input), 'utf-8');

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        if (!jsonOutput) s.stop('Failed.');
        log.error('Input file is not valid JSON.');
        process.exit(1);
        return;
      }

      const result = ApplicantInputSchema.safeParse(parsed);
      if (!result.success) {
        if (!jsonOutput) s.stop('Failed.');
        log.error('Input file failed validation:');
        log.error(result.error.message);
        process.exit(1);
        return;
      }

      if (!jsonOutput) {
        s.message('Evaluating...');
      }

      engine =
        args['jdm-path'] !== undefined
          ? new RiskProfilerEngine({ loader: createFileSystemLoader(args['jdm-path']) })
          : new RiskProfilerEngine();
      const evaluation = await engine.evaluate(result.data);

      if (!jsonOutput) {
        s.stop('Done.');
      }

      if (jsonOutput) {
        process.stdout.write(`${JSON.stringify(evaluation, null, 2)}\n`);
      } else {
        note(formatResult(evaluation), 'Risk Profile Result');
        outro('Evaluation complete.');
      }
    } catch (err) {
      if (!jsonOutput) s.stop('Failed.');
      log.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    } finally {
      engine?.dispose();
    }
  },
});
