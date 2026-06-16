import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RiskProfilerEngine } from '../src/engine.js';
import type { EvaluationResult } from '@vibedcoder/invespro-types';

describe('RiskProfilerEngine', () => {
  let engine: RiskProfilerEngine;

  beforeAll(() => {
    engine = new RiskProfilerEngine();
  });

  afterAll(() => {
    engine.dispose();
  });

  // ─── Happy path ────────────────────────────────────────────────────────────

  it('TC01 — maximum scores across all factors → Aggressive (56 pts)', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 20,
      riskAttitude: 'buy_more',
      investmentObjective: 'maximum_growth',
      annualIncome: 180_000,
      dtiRatio: 10,
      liquidityMonths: 8,
      investmentExperience: 'experienced',
    });

    expect(result.totalScore).toBe(56);
    expect(result.riskProfile).toBe('Aggressive');
    expectAllocation(result, { equities: 85, fixedIncome: 10, cash: 0, alternatives: 5 });
  });

  it('TC02 — minimum scores across all factors → Conservative (11 pts)', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 1,
      riskAttitude: 'sell_all',
      investmentObjective: 'capital_preservation',
      annualIncome: 45_000,
      dtiRatio: 49,
      liquidityMonths: 0.5,
      investmentExperience: 'none',
    });

    expect(result.totalScore).toBe(11);
    expect(result.riskProfile).toBe('Conservative');
    expectAllocation(result, { equities: 10, fixedIncome: 60, cash: 25, alternatives: 5 });
  });

  it('TC09 — balanced middle-ground inputs → Moderate (34 pts)', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 10,
      riskAttitude: 'hold',
      investmentObjective: 'balanced_growth',
      annualIncome: 55_000,
      dtiRatio: 20,
      liquidityMonths: 2,
      investmentExperience: 'beginner',
    });

    expect(result.totalScore).toBe(34);
    expect(result.riskProfile).toBe('Moderate');
    expectAllocation(result, { equities: 50, fixedIncome: 35, cash: 10, alternatives: 5 });
  });

  it('TC10 — cautious investor, short horizon → Moderately Conservative (23 pts)', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 2,
      riskAttitude: 'sell_some',
      investmentObjective: 'income_generation',
      annualIncome: 55_000,
      dtiRatio: 35,
      liquidityMonths: 4,
      investmentExperience: 'beginner',
    });

    expect(result.totalScore).toBe(23);
    expect(result.riskProfile).toBe('Moderately Conservative');
    expectAllocation(result, { equities: 30, fixedIncome: 50, cash: 15, alternatives: 5 });
  });

  it('TC11 — growth attitude, limited financial capacity → Moderately Aggressive (39 pts)', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 20,
      riskAttitude: 'buy_more',
      investmentObjective: 'maximum_growth',
      annualIncome: 55_000,
      dtiRatio: 35,
      liquidityMonths: 2,
      investmentExperience: 'beginner',
    });

    expect(result.totalScore).toBe(39);
    expect(result.riskProfile).toBe('Moderately Aggressive');
    expectAllocation(result, { equities: 70, fixedIncome: 20, cash: 5, alternatives: 5 });
  });

  // ─── DTI override boundary (override not yet implemented) ──────────────────

  it('TC03 — DTI override triggered at 55% → Conservative regardless of score', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 20,
      riskAttitude: 'buy_more',
      investmentObjective: 'maximum_growth',
      annualIncome: 180_000,
      dtiRatio: 55,
      liquidityMonths: 12,
      investmentExperience: 'experienced',
    });

    expect(result.riskProfile).toBe('Conservative');
    expect(result.overrideApplied).toBe(true);
    expectAllocation(result, { equities: 10, fixedIncome: 60, cash: 25, alternatives: 5 });
  });

  it('TC14 — DTI override exact boundary at 50% → Conservative regardless of score', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 20,
      riskAttitude: 'buy_more',
      investmentObjective: 'maximum_growth',
      annualIncome: 180_000,
      dtiRatio: 50,
      liquidityMonths: 8,
      investmentExperience: 'experienced',
    });

    expect(result.riskProfile).toBe('Conservative');
    expect(result.overrideApplied).toBe(true);
    expectAllocation(result, { equities: 10, fixedIncome: 60, cash: 25, alternatives: 5 });
  });

  // ─── DTI override NOT triggered ────────────────────────────────────────────

  it('TC04 — DTI = 49% does not trigger override, normal scoring applies (49 pts → Aggressive)', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 20,
      riskAttitude: 'buy_more',
      investmentObjective: 'maximum_growth',
      annualIncome: 180_000,
      dtiRatio: 49,
      liquidityMonths: 7,
      investmentExperience: 'experienced',
    });

    expect(result.totalScore).toBe(49);
    expect(result.riskProfile).toBe('Aggressive');
    expect(result.overrideApplied).toBe(false);
  });

  // ─── Band boundaries ───────────────────────────────────────────────────────

  it('TC05 — score = 20 lands in Moderately Conservative, not Conservative', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 2,
      riskAttitude: 'sell_all',
      investmentObjective: 'capital_preservation',
      annualIncome: 45_000,
      dtiRatio: 20,
      liquidityMonths: 4,
      investmentExperience: 'beginner',
    });

    expect(result.totalScore).toBe(20);
    expect(result.riskProfile).toBe('Moderately Conservative');
  });

  it('TC06 — score = 28 stays in Moderately Conservative, not Moderate', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 2,
      riskAttitude: 'sell_some',
      investmentObjective: 'income_generation',
      annualIncome: 55_000,
      dtiRatio: 20,
      liquidityMonths: 5,
      investmentExperience: 'intermediate',
    });

    expect(result.totalScore).toBe(28);
    expect(result.riskProfile).toBe('Moderately Conservative');
  });

  it('TC07 — score = 38 crosses into Moderately Aggressive, not Moderate', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 10,
      riskAttitude: 'hold',
      investmentObjective: 'balanced_growth',
      annualIncome: 55_000,
      dtiRatio: 20,
      liquidityMonths: 3,
      investmentExperience: 'intermediate',
    });

    expect(result.totalScore).toBe(38);
    expect(result.riskProfile).toBe('Moderately Aggressive');
  });

  it('TC08 — score = 46 stays in Moderately Aggressive, not Aggressive', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 20,
      riskAttitude: 'buy_more',
      investmentObjective: 'maximum_growth',
      annualIncome: 55_000,
      dtiRatio: 20,
      liquidityMonths: 6,
      investmentExperience: 'intermediate',
    });

    expect(result.totalScore).toBe(46);
    expect(result.riskProfile).toBe('Moderately Aggressive');
  });

  it('TC13 — score = 19 is the upper Conservative boundary, not Moderately Conservative', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 2,
      riskAttitude: 'sell_all',
      investmentObjective: 'capital_preservation',
      annualIncome: 45_000,
      dtiRatio: 14,
      liquidityMonths: 2,
      investmentExperience: 'none',
    });

    expect(result.totalScore).toBe(19);
    expect(result.riskProfile).toBe('Conservative');
  });

  // ─── Contradictory inputs ──────────────────────────────────────────────────

  it('TC12 — aggressive attitude + long horizon offset by weak financial capacity → Moderate (33 pts)', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 20,
      riskAttitude: 'buy_more',
      investmentObjective: 'maximum_growth',
      annualIncome: 45_000,
      dtiRatio: 49,
      liquidityMonths: 0.5,
      investmentExperience: 'none',
    });

    expect(result.totalScore).toBe(33);
    expect(result.riskProfile).toBe('Moderate');
  });

  // ─── Batch evaluation ─────────────────────────────────────────────────────

  it('evaluates applicants in order and summarizes batch outcomes', async () => {
    const result = await engine.evaluateMany([
      {
        applicantId: 'APP-001',
        investmentHorizonYears: 10,
        riskAttitude: 'hold',
        investmentObjective: 'balanced_growth',
        annualIncome: 55_000,
        dtiRatio: 20,
        liquidityMonths: 2,
        investmentExperience: 'beginner',
      },
      {
        applicantId: 'APP-002',
        answers: {
          investmentHorizonYears: 20,
          riskAttitude: 'buy_more',
          investmentObjective: 'maximum_growth',
          annualIncome: 180_000,
          dtiRatio: 50,
          liquidityMonths: 8,
          investmentExperience: 'experienced',
        },
      },
    ]);

    expect(result.summary).toEqual({
      total: 2,
      fulfilled: 2,
      rejected: 0,
    });
    expect(result.items[0]).toMatchObject({
      index: 0,
      applicantId: 'APP-001',
      status: 'fulfilled',
      result: {
        riskProfile: 'Moderate',
      },
    });
    expect(result.items[1]).toMatchObject({
      index: 1,
      applicantId: 'APP-002',
      status: 'fulfilled',
      result: {
        riskProfile: 'Conservative',
        overrideApplied: true,
      },
    });
  });

  it('keeps valid batch items when another item fails validation', async () => {
    const result = await engine.evaluateMany({
      items: [
        {
          applicantId: 'APP-001',
          investmentHorizonYears: 10,
          riskAttitude: 'hold',
          investmentObjective: 'balanced_growth',
          annualIncome: 55_000,
          dtiRatio: 20,
          liquidityMonths: 2,
          investmentExperience: 'beginner',
        },
        {
          applicantId: 'APP-002',
          dtiRatio: 150,
        },
      ],
    });

    expect(result.summary).toEqual({
      total: 2,
      fulfilled: 1,
      rejected: 1,
    });
    expect(result.items[1]).toMatchObject({
      index: 1,
      applicantId: 'APP-002',
      status: 'rejected',
      error: {
        code: 'validation_error',
      },
    });
  });

  it('rejects batches above the configured synchronous limit', async () => {
    await expect(
      engine.evaluateMany(
        [
          {
            investmentHorizonYears: 10,
            riskAttitude: 'hold',
            investmentObjective: 'balanced_growth',
            annualIncome: 55_000,
            dtiRatio: 20,
            liquidityMonths: 2,
            investmentExperience: 'beginner',
          },
          {
            investmentHorizonYears: 20,
            riskAttitude: 'buy_more',
            investmentObjective: 'maximum_growth',
            annualIncome: 180_000,
            dtiRatio: 20,
            liquidityMonths: 8,
            investmentExperience: 'experienced',
          },
        ],
        { maxBatchSize: 1 },
      ),
    ).rejects.toThrow('exceeds the maximum');
  });

  // ─── Engine lifecycle ──────────────────────────────────────────────────────

  it('throws when evaluate is called after dispose', async () => {
    const disposableEngine = new RiskProfilerEngine();
    disposableEngine.dispose();

    await expect(
      disposableEngine.evaluate({
        investmentHorizonYears: 10,
        riskAttitude: 'hold',
        investmentObjective: 'balanced_growth',
        annualIncome: 75_000,
        dtiRatio: 20,
        liquidityMonths: 4,
        investmentExperience: 'intermediate',
      }),
    ).rejects.toThrow('disposed');
  });

  it('rejects invalid input — dtiRatio above 100', async () => {
    await expect(
      engine.evaluate({
        investmentHorizonYears: 10,
        riskAttitude: 'hold',
        investmentObjective: 'balanced_growth',
        annualIncome: 75_000,
        dtiRatio: 150,
        liquidityMonths: 4,
        investmentExperience: 'intermediate',
      }),
    ).rejects.toThrow();
  });

  it('accepts a zero-year investment horizon', async () => {
    const result = await engine.evaluate({
      investmentHorizonYears: 0,
      riskAttitude: 'sell_all',
      investmentObjective: 'capital_preservation',
      annualIncome: 45_000,
      dtiRatio: 49,
      liquidityMonths: 0,
      investmentExperience: 'none',
    });

    expect(result.totalScore).toBe(11);
    expect(result.riskProfile).toBe('Conservative');
  });
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function expectAllocation(
  result: EvaluationResult,
  expected: { equities: number; fixedIncome: number; cash: number; alternatives: number },
): void {
  expect(result.allocation.equities).toBe(expected.equities);
  expect(result.allocation.fixedIncome).toBe(expected.fixedIncome);
  expect(result.allocation.cash).toBe(expected.cash);
  expect(result.allocation.alternatives).toBe(expected.alternatives);
}
