import type { EvaluationResult } from '@zagvar/helm-types';

/** Formats an evaluation result for interactive terminal output. */
export function formatResult(result: EvaluationResult): string {
  const allocationLines = Object.entries(result.allocation).map(
    ([assetClassId, percent]) =>
      `  ${humanize(assetClassId).padEnd(16)} ${pad(percent)}%  ${bar(percent)}`,
  );
  const lines: string[] = [
    `Risk Profile:     ${result.profile.label}`,
    `Normalized Score: ${result.normalizedScore?.toFixed(2) ?? 'Override'} / 100`,
    `Raw Score:        ${result.rawScore ?? 'Override'}`,
    `Override Applied: ${result.overrideApplied ? 'Yes' : 'No'}`,
    '',
    'Asset Allocation:',
    ...allocationLines,
    '',
    `Definition:       ${result.definition.id}@${result.definition.version}`,
    `Evaluated:        ${new Date(result.evaluatedAt).toLocaleString()}`,
  ];

  return lines.join('\n');
}

function pad(n: number): string {
  return String(n).padStart(5, ' ');
}

function bar(percent: number): string {
  const filled = Math.round(percent / 5);
  const empty = 20 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function humanize(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase());
}
