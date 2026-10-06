import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CreateTestUseCase } from './create-test.use-case';
import { TestStatus } from '@prisma/client';

describe('CreateTestUseCase', () => {
  let useCase: CreateTestUseCase;
  let mockTestsRepo: any;
  let mockJobsRepo: any;

  beforeEach(() => {
    mockTestsRepo = {
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'test-1',
          ...data,
          status: TestStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    };
    mockJobsRepo = {
      findById: vi.fn().mockImplementation((id: string) => {
        if (id === 'job-1') {
          return Promise.resolve({ id: 'job-1', title: 'Engenheiro Backend', status: 'OPEN' });
        }
        return Promise.resolve(null);
      }),
    };

    useCase = new CreateTestUseCase(mockTestsRepo, mockJobsRepo);
  });

  it('deve criar um teste com sucesso quando a vaga existe', async () => {
    const dto = {
      jobId: 'job-1',
      title: 'Teste Técnico Backend',
      description: 'Conhecimentos gerais em TypeScript',
    };

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.id).toBe('test-1');
    expect(result.title).toBe(dto.title);
    expect(result.status).toBe(TestStatus.DRAFT);
    expect(mockTestsRepo.create).toHaveBeenCalledWith(dto);
  });

  it('deve lançar NotFoundException se a vaga associada não for encontrada', async () => {
    const dto = {
      jobId: 'job-nao-existe',
      title: 'Teste Inválido',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(mockTestsRepo.create).not.toHaveBeenCalled();
  });
});
