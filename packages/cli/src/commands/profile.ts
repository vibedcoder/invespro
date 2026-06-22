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
import { RiskProfilerEngine } from '@zagvar/helm-core';
import type { AnswerValue, DefinitionQuestion } from '@zagvar/helm-types';
import { formatResult } from '../utils/format.js';
import { loadDefinition } from '../utils/definition.js';
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
    definition: {
      type: 'string',
      description: 'Path to a custom risk-profile definition',
    },
    output: {
      type: 'string',
      description: 'Output format: table (default) or json',
      default: 'table',
    },
  },
  run: async ({ args }) => {
    const jsonOutput = args.output === 'json';
    const restoreStdout = jsonOutput ? redirectStdoutToStderr() : undefined;
    intro('Investment Risk Profiling');

    let engine: RiskProfilerEngine | undefined;
    try {
      const definition =
        args.definition !== undefined
          ? await loadDefinition(args.definition)
          : undefined;
      engine =
        args['jdm-path'] !== undefined
          ? new RiskProfilerEngine({
              ...(definition !== undefined && { definition }),
              loader: createFileSystemLoader(args['jdm-path']),
            })
          : new RiskProfilerEngine({
              ...(definition !== undefined && { definition }),
            });

      const answers: Record<string, AnswerValue> = {};
      for (const question of engine.definition.questions) {
        const value = await askQuestion(question);
        if (isCancel(value)) {
          cancel('Risk profiling cancelled.');
          process.exit(0);
        }
        answers[question.id] = value;
      }

      const s = spinner();
      s.start('Evaluating your risk profile...');
      const result = await engine.evaluate({ answers });
      s.stop('Done.');

      if (jsonOutput) {
        restoreStdout?.();
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        note(formatResult(result), 'Your Risk Profile');
        outro('Risk profiling complete.');
      }
    } catch (err) {
      log.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    } finally {
      restoreStdout?.();
      engine?.dispose();
    }
  },
});

async function askQuestion(
  question: DefinitionQuestion,
): Promise<AnswerValue | symbol> {
  if (question.type === 'select' || question.type === 'boolean') {
    const options =
      question.type === 'boolean'
        ? [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ]
        : (question.options ?? []).map((option) => ({
            value: option.value,
            label: option.label,
            ...(option.hint !== undefined && { hint: option.hint }),
          }));
        const value = await select({
          message: question.text,
      options,
        });
    return value as AnswerValue | symbol;
  }

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
      const value = Number(input);
      if (!Number.isFinite(value)) return 'Please enter a valid number.';
      if (question.min !== undefined && value < question.min) {
        return `Minimum value is ${question.min}.`;
      }
      if (question.max !== undefined && value > question.max) {
        return `Maximum value is ${question.max}.`;
      }
      return undefined;
    },
  });
  return typeof raw === 'symbol' ? raw : Number(raw);
}

function redirectStdoutToStderr(): () => void {
  const originalWrite = process.stdout.write;
  process.stdout.write = process.stderr.write.bind(process.stderr);
  return () => {
    process.stdout.write = originalWrite;
  };
}
