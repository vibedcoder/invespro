import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { intro, log, outro, spinner } from '@clack/prompts';
import { defineCommand } from 'citty';
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { createFileSystemLoader } from '../utils/loader.js';

export default defineCommand({
  meta: {
    name: 'validate',
    description: 'Validate a JDM decision graph file',
  },
  args: {
    jdm: {
      type: 'string',
      description: 'Path to the JDM JSON file to validate',
      required: true,
    },
  },
  run: async ({ args }) => {
    intro('JDM Validation');

    const s = spinner();
    s.start(`Validating ${args.jdm}...`);

    let engine: RiskProfilerEngine | undefined;
    try {
      const raw = await readFile(resolve(process.cwd(), args.jdm), 'utf-8');

      // Step 1 — valid JSON
      let graph: unknown;
      try {
        graph = JSON.parse(raw);
      } catch {
        s.stop('Failed.');
        log.error('File is not valid JSON.');
        process.exit(1);
        return;
      }

      // Step 2 — expected JDM structure
      if (
        typeof graph !== 'object' ||
        graph === null ||
        !Array.isArray((graph as Record<string, unknown>)['nodes']) ||
        !Array.isArray((graph as Record<string, unknown>)['edges'])
      ) {
        s.stop('Failed.');
        log.error(
          'File does not have a valid JDM structure. ' +
            'Expected "nodes" and "edges" arrays at the root.',
        );
        process.exit(1);
        return;
      }

      // Step 3 — ZenEngine can load and execute the graph
      const loader = createFileSystemLoader(args.jdm);
      engine = new RiskProfilerEngine({ loader });

      await engine.evaluate({
        investmentHorizonYears: 10,
        riskAttitude: 'hold',
        investmentObjective: 'balanced_growth',
        annualIncome: 75_000,
        dtiRatio: 20,
        liquidityMonths: 4,
        investmentExperience: 'intermediate',
      });

      s.stop('Valid.');
      log.success(`${args.jdm} is a valid JDM graph.`);
      outro('Validation complete.');
    } catch (err) {
      s.stop('Failed.');
      log.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    } finally {
      engine?.dispose();
    }
  },
});