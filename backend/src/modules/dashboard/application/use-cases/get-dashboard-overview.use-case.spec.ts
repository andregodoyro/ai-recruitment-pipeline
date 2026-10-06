import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { GetDashboardOverviewUseCase } from './get-dashboard-overview.use-case';
import { CandidateStatus } from '@prisma/client';

describe('GetDashboardOverviewUseCase', () => {
  let useCase: GetDashboardOverviewUseCase;
  let mockDashboardRepo: any;
  let mockJobsRepo: any;

  const mockOverview = {
    metrics: {
      totalJobs: 5,
      openJobs: 3,
      totalCandidates: 20,
      totalResumes: 25,
      totalEvaluations: 20,
      totalTests: 15,
      totalInterviews: 8,
      conversionRateHiredPercentage: 10,
    },
    funnel: [
      { stage: CandidateStatus.NEW, label: 'Novos', count: 5, percentageOfTotal: 25 },
      { stage: CandidateStatus.HIRED, label: 'Contratados', count: 2, percentageOfTotal: 10 },
    ],
    scoreDistribution: [
      { range: '0-2', resumeCount: 0, testCount: 0 },
      { range: '8-10', resumeCount: 10, testCount: 5 },
    ],
    topCandidates: [
      {
        candidateId: 'cand-1',
        candidateName: 'Camila Santos',
        candidateEmail: 'camila@email.com',
        jobId: 'job-1',
        jobTitle: 'Backend Developer',
        finalScore: 9.2,
        resumeScore: 9.0,
        testScore: 9.5,
        status: CandidateStatus.INTERVIEW,
      },
    ],
  };

  beforeEach(() => {
    mockDashboardRepo = {
      getOverview: vi.fn().mockResolvedValue(mockOverview),
    };

    mockJobsRepo = {
      findById: vi.fn().mockImplementation((id: string) => {
        if (id === 'job-1') return Promise.resolve({ id: 'job-1', title: 'Backend' });
        return Promise.resolve(null);
      }),
    };

    useCase = new GetDashboardOverviewUseCase(mockDashboardRepo, mockJobsRepo);
  });

  it('deve retornar a visão geral do dashboard sem filtros', async () => {
    const res = await useCase.execute();

    expect(res).toBeDefined();
    expect(res.metrics.totalJobs).toBe(5);
    expect(res.funnel.length).toBe(2);
    expect(res.topCandidates[0].finalScore).toBe(9.2);
    expect(mockDashboardRepo.getOverview).toHaveBeenCalled();
  });

  it('deve retornar o dashboard filtrado por vaga existente', async () => {
    const res = await useCase.execute({ jobId: 'job-1' });

    expect(res).toBeDefined();
    expect(mockJobsRepo.findById).toHaveBeenCalledWith('job-1');
    expect(mockDashboardRepo.getOverview).toHaveBeenCalledWith({
      jobId: 'job-1',
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('deve lançar NotFoundException se a vaga filtrada não for encontrada', async () => {
    await expect(useCase.execute({ jobId: 'job-inexistente' })).rejects.toThrow(
      NotFoundException,
    );
    expect(mockDashboardRepo.getOverview).not.toHaveBeenCalled();
  });
});
