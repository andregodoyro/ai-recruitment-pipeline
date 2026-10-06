import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { AssignTestUseCase } from './assign-test.use-case';
import { TestStatus, CandidateStatus, CandidateTestStatus } from '@prisma/client';

describe('AssignTestUseCase', () => {
  let useCase: AssignTestUseCase;
  let mockCandidateTestsRepo: any;
  let mockTestsRepo: any;
  let mockCandidatesRepo: any;

  beforeEach(() => {
    mockCandidateTestsRepo = {
      findByCandidateAndTest: vi.fn().mockResolvedValue(null),
      assign: vi.fn().mockImplementation((candidateId: string, testId: string) =>
        Promise.resolve({
          id: 'candidate-test-1',
          candidateId,
          testId,
          status: CandidateTestStatus.PENDING,
          createdAt: new Date(),
        }),
      ),
    };
    mockTestsRepo = {
      findById: vi.fn().mockImplementation((id: string) => {
        if (id === 'test-published') {
          return Promise.resolve({ id: 'test-published', status: TestStatus.PUBLISHED });
        }
        if (id === 'test-draft') {
          return Promise.resolve({ id: 'test-draft', status: TestStatus.DRAFT });
        }
        return Promise.resolve(null);
      }),
    };
    mockCandidatesRepo = {
      findById: vi.fn().mockImplementation((id: string) => {
        if (id === 'cand-1') {
          return Promise.resolve({ id: 'cand-1', name: 'Maria Silva' });
        }
        return Promise.resolve(null);
      }),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new AssignTestUseCase(
      mockCandidateTestsRepo,
      mockTestsRepo,
      mockCandidatesRepo,
    );
  });

  it('deve atribuir teste publicado a candidato e atualizar status para TEST', async () => {
    const res = await useCase.execute('test-published', 'cand-1');

    expect(res).toBeDefined();
    expect(res.id).toBe('candidate-test-1');
    expect(res.status).toBe(CandidateTestStatus.PENDING);
    expect(mockCandidatesRepo.updateStatus).toHaveBeenCalledWith('cand-1', CandidateStatus.TEST);
  });

  it('deve lançar NotFoundException se teste não for encontrado', async () => {
    await expect(useCase.execute('test-nao-existe', 'cand-1')).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException se teste não estiver PUBLISHED', async () => {
    await expect(useCase.execute('test-draft', 'cand-1')).rejects.toThrow(BadRequestException);
  });

  it('deve lançar ConflictException se o teste já tiver sido atribuído ao candidato', async () => {
    mockCandidateTestsRepo.findByCandidateAndTest.mockResolvedValueOnce({ id: 'existing' });

    await expect(useCase.execute('test-published', 'cand-1')).rejects.toThrow(ConflictException);
  });
});
