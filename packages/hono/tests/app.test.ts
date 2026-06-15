import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import {
  createRiskProfilerApp,
  createRiskProfilerService,
} from '../src/index.js';

describe('createRiskProfilerApp', () => {
  let engine: RiskProfilerEngine;
  let app: ReturnType<typeof createRiskProfilerApp>;

  beforeAll(() => {
    engine = new RiskProfilerEngine();
    app = createRiskProfilerApp({ engine });
  });

  afterAll(() => {
    engine.dispose();
  });

  it('reports health', async () => {
    const response = await app.request('/health');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  it('serves the default questionnaire', async () => {
    const response = await app.request('/questions');
    const questions = await response.json();

    expect(response.status).toBe(200);
    expect(questions).toHaveLength(7);
  });

  it('evaluates a valid applicant', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        investmentHorizonYears: 10,
        riskAttitude: 'hold',
        investmentObjective: 'balanced_growth',
        annualIncome: 55_000,
        dtiRatio: 20,
        liquidityMonths: 2,
        investmentExperience: 'beginner',
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      totalScore: 34,
      riskProfile: 'Moderate',
      normalizedScore: 60.71,
      profile: {
        id: 'moderate',
      },
      overrideApplied: false,
    });
  });

  it('returns a conservative profile for the DTI override', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        investmentHorizonYears: 20,
        riskAttitude: 'buy_more',
        investmentObjective: 'maximum_growth',
        annualIncome: 180_000,
        dtiRatio: 50,
        liquidityMonths: 8,
        investmentExperience: 'experienced',
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      riskProfile: 'Conservative',
      profile: {
        id: 'conservative',
      },
      overrideApplied: true,
    });
  });

  it('returns structured validation errors', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dtiRatio: 150 }),
    });
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toMatchObject({
      error: {
        code: 'validation_error',
      },
    });
  });

  it('exposes explicit lifecycle ownership through the service API', async () => {
    const service = createRiskProfilerService();
    service.dispose();

    await expect(
      service.engine.evaluate({
        investmentHorizonYears: 10,
        riskAttitude: 'hold',
        investmentObjective: 'balanced_growth',
        annualIncome: 55_000,
        dtiRatio: 20,
        liquidityMonths: 2,
        investmentExperience: 'beginner',
      }),
    ).rejects.toThrow('disposed');
  });
});
