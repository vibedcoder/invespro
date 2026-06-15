import type { EvaluationResult } from '@vibedcoder/invespro-types';

/**
 * Formats an EvaluationResult as a human-readable string for terminal output.
 */
export function formatResult(result: EvaluationResult): string {
  const lines: string[] = [
    `Risk Profile:     ${result.riskProfile}`,
    `Total Score:      ${result.totalScore !== undefined ? `${result.totalScore} / 56` : 'Override'}`,
    `Override Applied: ${result.overrideApplied ? 'Yes' : 'No'}`,
    '',
    'Asset Allocation:',
    `  Equities        ${pad(result.allocation.equities)}%  ${bar(result.allocation.equities)}`,
    `  Fixed Income    ${pad(result.allocation.fixedIncome)}%  ${bar(result.allocation.fixedIncome)}`,
    `  Cash            ${pad(result.allocation.cash)}%  ${bar(result.allocation.cash)}`,
    `  Alternatives    ${pad(result.allocation.alternatives)}%  ${bar(result.allocation.alternatives)}`,
    '',
    `Evaluated:        ${new Date(result.evaluatedAt).toLocaleString()}`,
  ];

  return lines.join('\n');
}

function pad(n: number): string {
  return String(n).padStart(2, ' ');
}

function bar(percent: number): string {
  const filled = Math.round(percent / 5);
  const empty = 20 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}
