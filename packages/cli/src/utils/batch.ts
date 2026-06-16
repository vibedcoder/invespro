import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import type {
  AnswerValue,
  BatchEvaluationResult,
  DefinitionQuestion,
  RiskProfileDefinition,
} from '@vibedcoder/invespro-types';

export type BatchInputFormat = 'json' | 'csv';

/**
 * Normalizes JSON batch input into the envelope consumed by core.
 */
export function parseJsonBatch(value: unknown): Record<string, unknown>[] {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'object' && value !== null && 'items' in value
      ? (value as { items?: unknown }).items
      : undefined;
  if (!Array.isArray(items)) {
    throw new Error('JSON batch input must be an array or an object with an items array.');
  }
  return items.map((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`Batch item at index ${index} must be a JSON object.`);
    }
    return item as Record<string, unknown>;
  });
}

/**
 * Converts CSV rows into definition-driven answer envelopes.
 */
export function parseCsvBatch(
  content: string,
  definition: RiskProfileDefinition,
): Record<string, unknown>[] {
  const records = parse(content, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return records.map((record) => {
    const answers: Record<string, AnswerValue> = {};
    for (const question of definition.questions) {
      const raw = record[question.id];
      if (raw === undefined || raw === '') continue;
      answers[question.id] = coerceCsvValue(raw, question);
    }

    const applicantId = record['applicantId']?.trim();
    return {
      ...(applicantId !== undefined && applicantId.length > 0 && {
        applicantId,
      }),
      answers,
    };
  });
}

/** Serializes batch outcomes into a flat, spreadsheet-friendly CSV report. */
export function formatBatchCsv(result: BatchEvaluationResult): string {
  const allocationKeys = Array.from(
    new Set(
      result.items.flatMap((item) =>
        item.status === 'fulfilled'
          ? Object.keys(item.result.allocation)
          : [],
      ),
    ),
  );
  const allocationColumns = allocationKeys.map((key) => `allocation_${key}`);
  const columns = [
    'index',
    'applicantId',
    'status',
    'profileId',
    'profileLabel',
    'rawScore',
    'normalizedScore',
    'overrideApplied',
    'overrideId',
    ...allocationColumns,
    'errorCode',
    'errorMessage',
  ];

  const rows = result.items.map((item) => {
    if (item.status === 'fulfilled') {
      return {
        index: item.index,
        applicantId: item.applicantId,
        status: item.status,
        profileId: item.result.profile.id,
        profileLabel: item.result.profile.label,
        rawScore: item.result.rawScore,
        normalizedScore: item.result.normalizedScore,
        overrideApplied: item.result.overrideApplied,
        overrideId: item.result.overrideId,
        ...Object.fromEntries(
          allocationKeys.map((key) => [
            `allocation_${key}`,
            item.result.allocation[key],
          ]),
        ),
      };
    }

    return {
      index: item.index,
      applicantId: item.applicantId,
      status: item.status,
      errorCode: item.error.code,
      errorMessage: item.error.message,
    };
  });

  return stringify(rows, {
    columns,
    header: true,
  });
}

export function inferBatchInputFormat(path: string): BatchInputFormat {
  return path.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
}

function coerceCsvValue(raw: string, question: DefinitionQuestion): AnswerValue {
  if (question.type === 'number') {
    const value = Number(raw);
    return Number.isFinite(value) ? value : raw;
  }
  if (question.type === 'boolean') {
    const normalized = raw.trim().toLowerCase();
    if (['true', 't', 'yes', 'y', '1'].includes(normalized)) return true;
    if (['false', 'f', 'no', 'n', '0'].includes(normalized)) return false;
    return raw;
  }

  const option = question.options?.find(
    (candidate) => String(candidate.value) === raw,
  );
  return option?.value ?? raw;
}
