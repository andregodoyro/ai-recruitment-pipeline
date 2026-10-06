import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { GetJobRankingUseCase } from './get-job-ranking.use-case';
import { Recommendation } from '@prisma/client';

const makeEvaluation = (candidateId: string, finalScore: number) => ({
  id: `ev-${candidateId}`,
  candidateId,
  jobId: 'job-1',
  resumeId: 'res-1',
  finalScore,
  educationScore: finalScore,
  automationScore: finalScore,
  dataScore: finalScore,
  experienceScore: finalScore,
  technologyScore: finalScore,
  behavioralScore: finalScore,
  strengths: [],
  gaps: [],
  justification: '',
  recommendation: Recommendation.APPROVED,
  promptVersion: 'v1',
  aiModel: 'gpt-4o-mini',
  rawAiResponse: '{}',
  createdAt: new Date(),
});

const makeCandidateTest = (candidateId: string, score: number) => ({
  id: `ct-${candidateId}`,
  candidateId,
  testId: 'test-1',
  score,
  status: 'GRADED' as any,
  submittedAt: new Date(),
  gradedAt: new Date(),
  createdAt: new Date(),
});

describe('GetJobRankingUseCase', () => {
  let useCase: GetJobRankingUseCase;
  let mockRankingRepo: any;
  let mockJobsRepo: any;
  let mockCandidatesRepo: any;

  const mockJob = {
    id: 'job-1',
    status: 'OPEN',
    rankingResumeWeight: 60,
    rankingTestWeight: 40,
  };

  const mockCandidates = {
    'cand-1': { id: 'cand-1', name: 'Ana Lima', email: 'ana@test.com' },
    'cand-2': { id: 'cand-2', name: 'Bruno Costa', email: 'bruno@test.com' },
    'cand-3': { id: 'cand-3', name: 'Carla Souza', email: 'carla@test.com' },
  };

  beforeEach(() => {
    mockJobsRepo = {
      findById: vi.fn().mockImplementation((id: string) =>
        id === 'job-1' ? Promise.resolve(mockJob) : Promise.resolve(null),
      ),
    };

    mockCandidatesRepo = {
      findById: vi.fn().mockImplementation((id: string) =>
        Promise.resolve(mockCandidates[id] ?? null),
      ),
    };

    mockRankingRepo = {
      findEvaluationsByJobId: vi.fn().mockResolvedValue([
        makeEvaluation('cand-1', 8.0),
        makeEvaluation('cand-2', 6.0),
        makeEvaluation('cand-3', 9.0),
      ]),
      findCandidateTestsByJobId: vi.fn().mockResolvedValue([
        makeCandidateTest('cand-1', 7.0),
        makeCandidateTest('cand-3', 10.0),
        // cand-2 has no test
      ]),
    };

    useCase = new GetJobRankingUseCase(mockRankingRepo, mockJobsRepo, mockCandidatesRepo);
  });

  it('deve lançar NotFoundException se a vaga não existir', async () => {
    await expect(useCase.execute('job-inexistente')).rejects.toThrow(NotFoundException);
  });

  it('deve calcular o ranking corretamente com pesos 60/40', async () => {
    const ranking = await useCase.execute('job-1');

    expect(ranking.length).toBe(3);

    // cand-3: 9.0 * 0.60 + 10.0 * 0.40 = 5.40 + 4.00 = 9.40
    expect(ranking[0].candidateId).toBe('cand-3');
    expect(ranking[0].finalScore).toBe(9.40);
    expect(ranking[0].rankingPosition).toBe(1);

    // cand-1: 8.0 * 0.60 + 7.0 * 0.40 = 4.80 + 2.80 = 7.60
    expect(ranking[1].candidateId).toBe('cand-1');
    expect(ranking[1].finalScore).toBe(7.60);
    expect(ranking[1].rankingPosition).toBe(2);

    // cand-2: só tem resumeScore=6.0 (sem teste), finalScore = 6.0
    expect(ranking[2].candidateId).toBe('cand-2');
    expect(ranking[2].finalScore).toBe(6.0);
    expect(ranking[2].testScore).toBeNull();
    expect(ranking[2].rankingPosition).toBe(3);
  });

  it('deve atribuir mesma posição para candidatos com mesmo finalScore', async () => {
    mockRankingRepo.findEvaluationsByJobId.mockResolvedValueOnce([
      makeEvaluation('cand-1', 7.0),
      makeEvaluation('cand-2', 7.0),
    ]);
    mockRankingRepo.findCandidateTestsByJobId.mockResolvedValueOnce([]);

    const ranking = await useCase.execute('job-1');

    expect(ranking[0].rankingPosition).toBe(1);
    expect(ranking[1].rankingPosition).toBe(1);
  });

  it('deve incluir resumeScore e testScore individuais na resposta', async () => {
    const ranking = await useCase.execute('job-1');
    const cand1 = ranking.find((r) => r.candidateId === 'cand-1')!;

    expect(cand1.resumeScore).toBe(8.0);
    expect(cand1.testScore).toBe(7.0);
    expect(cand1.candidateName).toBe('Ana Lima');
    expect(cand1.candidateEmail).toBe('ana@test.com');
  });
});
