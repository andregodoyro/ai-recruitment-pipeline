import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EvaluateResumeUseCase } from './evaluate-resume.use-case';
import { CandidateStatus, Recommendation } from '@prisma/client';

describe('EvaluateResumeUseCase', () => {
  let useCase: EvaluateResumeUseCase;
  let mockScreeningRepo: any;
  let mockCandidatesRepo: any;
  let mockJobsRepo: any;
  let mockResumesRepo: any;
  let mockAiEvaluator: any;

  beforeEach(() => {
    mockScreeningRepo = {
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'eval-1',
          ...data,
          createdAt: new Date(),
        }),
      ),
    };
    mockCandidatesRepo = {
      findById: vi.fn().mockImplementation((id) => {
        if (id === 'cand-1') return Promise.resolve({ id: 'cand-1', status: CandidateStatus.SCREENING });
        return Promise.resolve(null);
      }),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };
    mockJobsRepo = {
      findById: vi.fn().mockImplementation((id) => {
        if (id === 'job-1')
          return Promise.resolve({
            id: 'job-1',
            title: 'Dev Fullstack',
            description: 'NestJS + Next.js',
            requirements: 'TypeScript',
            desiredSkills: ['Docker'],
            experienceLevel: 'SENIOR',
            educationWeight: 15,
            automationWeight: 20,
            dataWeight: 20,
            experienceWeight: 20,
            technologyWeight: 15,
            behavioralWeight: 10,
          });
        return Promise.resolve(null);
      }),
    };
    mockResumesRepo = {
      findById: vi.fn().mockImplementation((id) => {
        if (id === 'res-1')
          return Promise.resolve({ id: 'res-1', extractedText: 'CV Válido com experiências' });
        return Promise.resolve(null);
      }),
      findByCandidateAndJob: vi.fn().mockResolvedValue([
        { id: 'res-1', isActive: true, extractedText: 'CV Válido com experiências' },
      ]),
    };
    mockAiEvaluator = {
      evaluate: vi.fn().mockResolvedValue({
        scores: { education: 8, automation: 8, data: 8, experience: 8, technology: 8, behavioral: 8 },
        finalScore: 8.0,
        strengths: ['Excelente formação'],
        gaps: [],
        justification: 'Candidato apto.',
        recommendation: 'APPROVED',
        promptVersion: '1.0.0',
        aiModel: 'gpt-4o-mini',
        rawResponse: '{}',
      }),
    };

    useCase = new EvaluateResumeUseCase(
      mockScreeningRepo,
      mockCandidatesRepo,
      mockJobsRepo,
      mockResumesRepo,
      mockAiEvaluator,
    );
  });

  it('deve executar a triagem com sucesso e atualizar candidato para SCREENING_APPROVED', async () => {
    const dto = { candidateId: 'cand-1', jobId: 'job-1', resumeId: 'res-1' };
    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.id).toBe('eval-1');
    expect(result.finalScore).toBe(8.0);
    expect(result.recommendation).toBe(Recommendation.APPROVED);
    expect(mockCandidatesRepo.updateStatus).toHaveBeenCalledWith('cand-1', CandidateStatus.SCREENING_APPROVED);
  });

  it('deve lançar NotFoundException se o candidato não for encontrado', async () => {
    const dto = { candidateId: 'invalid', jobId: 'job-1' };
    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException se o currículo não possuir texto extraído', async () => {
    mockResumesRepo.findById.mockResolvedValue({ id: 'res-empty', extractedText: '' });
    const dto = { candidateId: 'cand-1', jobId: 'job-1', resumeId: 'res-empty' };
    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });
});
