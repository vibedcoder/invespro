import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { RiskProfilerEngine } from '@zagvar/helm-core';
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

  it('serves the active definition', async () => {
    const response = await app.request('/definition');
    const definition = await response.json();

    expect(response.status).toBe(200);
    expect(definition).toMatchObject({
      schemaVersion: '1.0',
      id: 'helmDefaultRiskProfiler',
      version: '0.1.0',
    });
    expect(definition.questions).toHaveLength(7);
    expect(definition.allocations).toHaveProperty('moderate');
  });

  it('validates a definition payload', async () => {
    const definitionResponse = await app.request('/definition');
    const definition = await definitionResponse.json();

    const response = await app.request('/definitions/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(definition),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      valid: true,
      definition: {
        id: 'helmDefaultRiskProfiler',
      },
    });
  });

  it('returns structured definition validation details', async () => {
    const response = await app.request('/definitions/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: '1.0',
        id: 'invalidDefinition',
        name: 'Invalid Definition',
        version: '0.1.0',
        questions: [],
        scoring: [],
        profiles: [],
        scoreBands: [],
        assetClasses: [],
        allocations: {},
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toMatchObject({
      error: {
        code: 'validation_error',
        message: 'Invalid risk profile definition.',
        details: {
          fieldErrors: {
            questions: expect.any(Array),
            scoring: expect.any(Array),
          },
        },
      },
    });
  });

  it('returns the shared error envelope for invalid JSON', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result).toEqual({
      error: {
        code: 'invalid_json',
        message: 'Request body must be valid JSON.',
      },
    });
  });

  it('evaluates a valid applicant', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        answers: {
          investmentHorizonYears: 10,
          riskAttitude: 'hold',
          investmentObjective: 'balanced_growth',
          annualIncome: 55_000,
          dtiRatio: 20,
          liquidityMonths: 2,
          investmentExperience: 'beginner',
        },
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      rawScore: 34,
      normalizedScore: 60.71,
      profile: {
        id: 'moderate',
        label: 'Moderate',
      },
      overrideApplied: false,
    });
  });

  it('returns a conservative profile for the DTI override', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        answers: {
          investmentHorizonYears: 20,
          riskAttitude: 'buy_more',
          investmentObjective: 'maximum_growth',
          annualIncome: 180_000,
          dtiRatio: 50,
          liquidityMonths: 8,
          investmentExperience: 'experienced',
        },
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      profile: {
        id: 'conservative',
        label: 'Conservative',
      },
      overrideApplied: true,
    });
  });

  it('returns structured validation errors', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        answers: {
          dtiRatio: 150,
        },
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toMatchObject({
      error: {
        code: 'validation_error',
      },
    });
  });

  it('evaluates a batch and preserves per-item errors', async () => {
    const response = await app.request('/evaluate/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            applicantId: 'APP-001',
            answers: {
              investmentHorizonYears: 10,
              riskAttitude: 'hold',
              investmentObjective: 'balanced_growth',
              annualIncome: 55_000,
              dtiRatio: 20,
              liquidityMonths: 2,
              investmentExperience: 'beginner',
            },
          },
          {
            applicantId: 'APP-002',
            answers: {
              dtiRatio: 150,
            },
          },
        ],
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
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
            profile: {
              label: 'Moderate',
            },
          },
        },
        {
          index: 1,
          applicantId: 'APP-002',
          status: 'rejected',
          error: {
            code: 'validation_error',
          },
        },
      ],
    });
  });

  it('rejects malformed batch requests with structured details', async () => {
    const response = await app.request('/evaluate/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [],
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toMatchObject({
      error: {
        code: 'validation_error',
        message: 'Invalid batch evaluation input.',
        details: {
          fieldErrors: {
            items: expect.any(Array),
          },
        },
      },
    });
  });

  it('evaluates CSV batch input and returns JSON results', async () => {
    const csv = [
      'applicantId,investmentHorizonYears,riskAttitude,investmentObjective,annualIncome,dtiRatio,liquidityMonths,investmentExperience',
      'APP-CSV-001,10,hold,balanced_growth,55000,20,2,beginner',
      'APP-CSV-002,20,buy_more,maximum_growth,180000,50,8,experienced',
    ].join('\n');

    const response = await app.request('/evaluate/batch/csv', {
      method: 'POST',
      headers: { 'content-type': 'text/csv' },
      body: csv,
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      summary: {
        total: 2,
        fulfilled: 2,
        rejected: 0,
      },
      items: [
        {
          index: 0,
          applicantId: 'APP-CSV-001',
          status: 'fulfilled',
          result: {
            profile: {
              label: 'Moderate',
            },
          },
        },
        {
          index: 1,
          applicantId: 'APP-CSV-002',
          status: 'fulfilled',
          result: {
            profile: {
              label: 'Conservative',
            },
            overrideApplied: true,
          },
        },
      ],
    });
  });

  it('rejects empty CSV batches', async () => {
    const response = await app.request('/evaluate/batch/csv', {
      method: 'POST',
      headers: { 'content-type': 'text/csv' },
      body: [
        'applicantId,investmentHorizonYears,riskAttitude,investmentObjective,annualIncome,dtiRatio,liquidityMonths,investmentExperience',
      ].join('\n'),
    });
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toEqual({
      error: {
        code: 'validation_error',
        message: 'CSV batch input must contain at least one row.',
      },
    });
  });

  it('rejects batch requests above the configured limit', async () => {
    const limitedApp = createRiskProfilerApp({
      engine,
      maxBatchSize: 1,
    });
    const response = await limitedApp.request('/evaluate/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            answers: {
              dtiRatio: 20,
            },
          },
          {
            answers: {
              dtiRatio: 30,
            },
          },
        ],
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toMatchObject({
      error: {
        code: 'validation_error',
        message: 'Batch size 2 exceeds the maximum of 1.',
      },
    });
  });

  it('can be mounted under a parent Hono app', async () => {
    const parent = new Hono();
    parent.route('/risk', app);

    const response = await parent.request('/risk/health');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  it('exposes explicit lifecycle ownership through the service API', async () => {
    const service = createRiskProfilerService();
    service.dispose();

    await expect(
      service.engine.evaluate({
        answers: {
          investmentHorizonYears: 10,
          riskAttitude: 'hold',
          investmentObjective: 'balanced_growth',
          annualIncome: 55_000,
          dtiRatio: 20,
          liquidityMonths: 2,
          investmentExperience: 'beginner',
        },
      }),
    ).rejects.toThrow('disposed');
  });
});
