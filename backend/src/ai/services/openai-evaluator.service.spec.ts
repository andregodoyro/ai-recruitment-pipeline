import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { OpenAiEvaluatorService } from './openai-evaluator.service';

describe('OpenAiEvaluatorService', () => {
  let service: OpenAiEvaluatorService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return undefined;
        if (key === 'OPENAI_MODEL') return 'gpt-4o-mini';
        if (key === 'OPENAI_TIMEOUT_MS') return 30000;
        return undefined;
      }),
    };
    service = new OpenAiEvaluatorService(mockConfigService as ConfigService);
  });

  it('deve realizar avaliação fallback determinística quando API key não estiver presente', async () => {
    const input = {
      candidateId: 'cand-1',
      jobId: 'job-1',
      resumeId: 'res-1',
      jobTitle: 'Dev Backend',
      jobDescription: 'NestJS e Postgres',
      requirements: 'TypeScript',
      desiredSkills: ['Docker'],
      experienceLevel: 'SENIOR',
      educationWeight: 15,
      automationWeight: 20,
      dataWeight: 20,
      experienceWeight: 20,
      technologyWeight: 15,
      behavioralWeight: 10,
      resumeText: 'Experiência de 5 anos em Node.js e TypeScript com desenvolvimento de APIs.',
    };

    const result = await service.evaluate(input);

    expect(result).toBeDefined();
    expect(result.finalScore).toBeGreaterThanOrEqual(5.0);
    expect(result.scores.education).toBeDefined();
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.promptVersion).toBe('1.0.0');
  });
});
