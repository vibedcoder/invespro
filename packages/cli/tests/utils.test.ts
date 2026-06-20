import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_GRAPH_KEY } from '@vibedcoder/invespro-core';
import type { BatchEvaluationResult } from '@vibedcoder/invespro-types';
import packageJson from '../package.json' with { type: 'json' };
import {
  formatBatchCsv,
  inferBatchInputFormat,
  parseJsonBatch,
} from '../src/utils/batch.js';
import { createFileSystemLoader } from '../src/utils/loader.js';

const tempDir = join(process.cwd(), 'tmp-cli-tests');

afterEach(async () => {
  await rm(tempDir, { force: true, recursive: true });
});

describe('CLI package contract', () => {
  it('exposes the invespro binary', () => {
    expect(packageJson.bin).toEqual({
      invespro: './dist/index.js',
    });
  });
});

describe('parseJsonBatch', () => {
  it('accepts an array of batch items', () => {
    expect(parseJsonBatch([{ answers: { dtiRatio: 20 } }])).toEqual([
      { answers: { dtiRatio: 20 } },
    ]);
  });

  it('accepts an object with an items array', () => {
    expect(
      parseJsonBatch({
        items: [{ applicantId: 'APP-001', answers: { dtiRatio: 20 } }],
      }),
    ).toEqual([{ applicantId: 'APP-001', answers: { dtiRatio: 20 } }]);
  });

  it('rejects missing items', () => {
    expect(() => parseJsonBatch({ applicants: [] })).toThrow(
      'JSON batch input must be an array or an object with an items array.',
    );
  });

  it('rejects non-object batch items', () => {
    expect(() => parseJsonBatch(['bad'])).toThrow(
      'Batch item at index 0 must be a JSON object.',
    );
  });
});

describe('inferBatchInputFormat', () => {
  it('detects CSV files case-insensitively', () => {
    expect(inferBatchInputFormat('applicants.CSV')).toBe('csv');
  });

  it('defaults to JSON for non-CSV paths', () => {
    expect(inferBatchInputFormat('applicants.json')).toBe('json');
    expect(inferBatchInputFormat('applicants')).toBe('json');
  });
});

describe('formatBatchCsv', () => {
  it('formats fulfilled and rejected rows with allocation columns', async () => {
    const csv = formatBatchCsv({
      summary: {
        total: 2,
        fulfilled: 1,
        rejected: 1,
      },
      items: [
        {
          index: 0,
          applicantId: 'APP-001',
          status: 'fulfilled',
          result: {
            applicantId: 'APP-001',
            rawScore: 40,
            normalizedScore: 71.43,
            profile: {
              id: 'moderatelyAggressive',
              label: 'Moderately Aggressive',
            },
            overrideApplied: false,
            allocation: {
              equities: 70,
              fixedIncome: 20,
            },
            evaluatedAt: '2026-06-20T00:00:00.000Z',
            definition: {
              id: 'invesproDefaultRiskProfiler',
              version: '0.1.0',
              schemaVersion: '1.0',
              graphChecksum: 'sha256:test',
            },
          },
        },
        {
          index: 1,
          applicantId: 'APP-002',
          status: 'rejected',
          error: {
            code: 'validation_error',
            message: 'Invalid evaluation input.',
          },
        },
      ],
    } satisfies BatchEvaluationResult);

    expect(csv).toContain('allocation_equities');
    expect(csv).toContain('allocation_fixedIncome');
    expect(csv).toContain('APP-001,fulfilled,moderatelyAggressive');
    expect(csv).toContain('APP-002,rejected');
    expect(csv).toContain('validation_error,Invalid evaluation input.');
  });
});

describe('createFileSystemLoader', () => {
  it('loads the configured graph for the default key', async () => {
    await mkdir(tempDir, { recursive: true });
    await writeFile(join(tempDir, 'graph.json'), '{"nodes":[],"edges":[]}', 'utf8');

    const loader = createFileSystemLoader(join(tempDir, 'graph.json'));
    const content = await loader(DEFAULT_GRAPH_KEY);

    expect(JSON.parse(content.toString('utf8'))).toEqual({
      nodes: [],
      edges: [],
    });
  });

  it('rejects unknown graph keys', async () => {
    const loader = createFileSystemLoader('graph.json');

    await expect(loader('unknown')).rejects.toThrow(
      '[invespro-cli] Unknown graph key: "unknown"',
    );
  });

  it('resolves graph paths from the current working directory', async () => {
    await mkdir(tempDir, { recursive: true });
    await writeFile(join(tempDir, 'graph.json'), '{"ok":true}', 'utf8');

    const loader = createFileSystemLoader(join('tmp-cli-tests', 'graph.json'));
    const content = await loader(DEFAULT_GRAPH_KEY);

    await expect(readFile(join(tempDir, 'graph.json'), 'utf8')).resolves.toBe(
      content.toString('utf8'),
    );
  });
});
