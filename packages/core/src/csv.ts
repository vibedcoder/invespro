import { parse } from 'csv-parse/sync';
import type {
  AnswerValue,
  DefinitionQuestion,
  RiskProfileDefinition,
} from '@zagvar/helm-types';

/**
 * Converts CSV rows into definition-driven batch evaluation inputs.
 *
 * CSV columns should use public question IDs. `applicantId` is optional and is
 * echoed in each successful or rejected batch item when present.
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
