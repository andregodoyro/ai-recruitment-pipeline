import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateInterviewUseCase } from './create-interview.use-case';
import { CandidateStatus, JobStatus, InterviewStatus } from '@prisma/client';

describe('CreateInterviewUseCase', () => {
  let useCase: CreateInterviewUseCase;
  let mockInterviewsRepo: any;
  let mockCandidatesRepo: any;
  let mockJobsRepo: any;

  beforeEach(() => {
    mockInterviewsRepo = {
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'int-1',
          ...data,
          status: InterviewStatus.SCHEDULED,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    };

    mockCandidatesRepo = {
      findById: vi.fn().mockImplementation((id: string) => {
        if (id === 'cand-approved') {
          return Promise.resolve({
            id: 'cand-approved',
            name: 'Carlos Alberto',
            status: CandidateStatus.TEST_APPROVED,
          });
        }
        if (id === 'cand-interview') {
          return Promise.resolve({
            id: 'cand-interview',
            name: 'Carlos Já Em Entrevista',
            status: CandidateStatus.INTERVIEW,
          });
        }
        if (id === 'cand-not-approved') {
          return Promise.resolve({
            id: 'cand-not-approved',
            name: 'João Pendente',
            status: CandidateStatus.TEST,
          });
        }
        return Promise.resolve(null);
      }),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };

    mockJobsRepo = {
      findById: vi.fn().mockImplementation((id: string) => {
        if (id === 'job-open') {
          return Promise.resolve({ id: 'job-open', status: JobStatus.OPEN });
        }
        if (id === 'job-closed') {
          return Promise.resolve({ id: 'job-closed', status: JobStatus.CLOSED });
        }
        return Promise.resolve(null);
      }),
    };

    useCase = new CreateInterviewUseCase(
      mockInterviewsRepo,
      mockCandidatesRepo,
      mockJobsRepo,
    );
  });

  it('deve agendar uma entrevista com sucesso quando candidato tem status TEST_APPROVED', async () => {
    const dto = {
      candidateId: 'cand-approved',
      jobId: 'job-open',
      scheduledAt: '2026-10-20T14:00:00.000Z',
      meetingUrl: 'https://meet.google.com/test-url',
      notes: 'Entrevista técnica final',
    };

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.id).toBe('int-1');
    expect(result.candidateId).toBe('cand-approved');
    expect(result.status).toBe(InterviewStatus.SCHEDULED);
    expect(mockCandidatesRepo.updateStatus).toHaveBeenCalledWith(
      'cand-approved',
      CandidateStatus.INTERVIEW,
    );
  });

  it('deve permitir agendamento se candidato já estiver com status INTERVIEW (reagendamento ou 2ª etapa)', async () => {
    const dto = {
      candidateId: 'cand-interview',
      jobId: 'job-open',
      scheduledAt: '2026-10-22T10:00:00.000Z',
    };

    const result = await useCase.execute(dto);
    expect(result).toBeDefined();
    expect(result.id).toBe('int-1');
  });

  it('deve lançar BadRequestException se candidato NÃO estiver em TEST_APPROVED', async () => {
    const dto = {
      candidateId: 'cand-not-approved',
      jobId: 'job-open',
      scheduledAt: '2026-10-20T14:00:00.000Z',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(mockInterviewsRepo.create).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se candidato não existir', async () => {
    const dto = {
      candidateId: 'cand-nao-existe',
      jobId: 'job-open',
      scheduledAt: '2026-10-20T14:00:00.000Z',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException se vaga estiver fechada', async () => {
    const dto = {
      candidateId: 'cand-approved',
      jobId: 'job-closed',
      scheduledAt: '2026-10-20T14:00:00.000Z',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });
});
