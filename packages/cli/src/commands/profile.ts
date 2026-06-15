import {
  cancel,
  intro,
  isCancel,
  log,
  note,
  outro,
  select,
  spinner,
  text,
} from '@clack/prompts';
import { defineCommand } from 'citty';
import { QUESTIONS, RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { ApplicantInputSchema } from '@vibedcoder/invespro-types';
import { formatResult } from '../utils/format.js';
import { createFileSystemLoader } from '../utils/loader.js';

export default defineCommand({
  meta: {
    name: 'profile',
    description: 'Run an interactive investment risk profiling questionnaire',
  },
  args: {
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
    intro('Investment Risk Profiling');

    const answers: Record<string, string | number> = {};

    for (const question of QUESTIONS) {
      if (question.type === 'select') {
        const value = await select({
          message: question.text,
          options: (question.options ?? []).map((opt) => ({
            value: String(opt.value),
            label: opt.label,
            ...(opt.hint !== undefined && { hint: opt.hint }),
          })),
        });

        if (isCancel(value)) {
          cancel('Risk profiling cancelled.');
          process.exit(0);
        }

        answers[question.id] = value as string;
      } else {
        const hint = [
          question.hint,
          question.unit !== undefined ? `Unit: ${question.unit}` : undefined,
          question.min !== undefined ? `Min: ${question.min}` : undefined,
          question.max !== undefined ? `Max: ${question.max}` : undefined,
        ]
          .filter(Boolean)
          .join(' · ');

        const raw = await text({
          message: question.text,
          ...(hint.length > 0 && { placeholder: hint }),
          validate: (input: string | undefined): string | Error | undefined => {
            if (input === undefined) return 'Please enter a value.';
            const n = parseFloat(input);
            if (isNaN(n)) return 'Please enter a valid number.';
            if (question.min !== undefined && n < question.min) {
              return `Minimum value is ${question.min}.`;
            }
            if (question.max !== undefined && n > question.max) {
              return `Maximum value is ${question.max}.`;
            }
            return undefined;
          },
        });

        if (isCancel(raw)) {
          cancel('Risk profiling cancelled.');
          process.exit(0);
        }

        answers[question.id] = parseFloat(raw as string);
      }
    }

    const s = spinner();
    s.start('Evaluating your risk profile...');

    let engine: RiskProfilerEngine | undefined;
    try {
      engine =
        args['jdm-path'] !== undefined
            ? new RiskProfilerEngine({ loader: createFileSystemLoader(args['jdm-path']) })
            : new RiskProfilerEngine();

      // Parse through schema to get correct types before passing to engine
      const input = ApplicantInputSchema.parse(answers);
      const result = await engine.evaluate(input);

      s.stop('Done.');

      if (args.output === 'json') {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        note(formatResult(result), 'Your Risk Profile');
      }

      outro('Risk profiling complete.');
    } catch (err) {
      s.stop('Failed.');
      log.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    } finally {
      engine?.dispose();
    }
  },
});
