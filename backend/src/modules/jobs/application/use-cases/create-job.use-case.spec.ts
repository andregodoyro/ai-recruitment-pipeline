import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CreateJobUseCase } from './create-job.use-case';
import { IJobsRepository } from '../../domain/jobs.repository.interface';
import { ExperienceLevel, JobStatus } from '@prisma/client';

describe('CreateJobUseCase', () => {
  let useCase: CreateJobUseCase;
  let mockRepository: Partial<IJobsRepository>;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'job-uuid-1',
          ...data,
          status: JobStatus.OPEN,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    };
    useCase = new CreateJobUseCase(mockRepository as IJobsRepository);
  });

  it('deve criar uma vaga com pesos padro vlidos', async () => {
    const dto = {
      title: 'Desenvolvedor Backend',
      description: 'Vaga para NestJS',
      requirements: 'TypeScript, Node.js',
      experienceLevel: ExperienceLevel.SENIOR,
    };

    const result = await useCase.execute(dto as any);

    expect(result).toBeDefined();
    expect(result.id).toBe('job-uuid-1');
    expect(result.title).toBe('Desenvolvedor Backend');
    expect(mockRepository.create).toHaveBeenCalledOnce();
  });

  it('deve lanar BadRequestException se os pesos de avaliao no somarem 100', async () => {
    const dto = {
      title: 'Desenvolvedor Frontend',
      description: 'Vaga React',
      requirements: 'React, Next.js',
      experienceLevel: ExperienceLevel.MID,
      educationWeight: 50, // 50 + 20 + 20 + 20 + 15 + 10 = 135
    };

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve lanar BadRequestException se os pesos de ranking no somarem 100', async () => {
    const dto = {
      title: 'QA Engineer',
      description: 'Vaga de Testes',
      requirements: 'Cypress, Vitest',
      experienceLevel: ExperienceLevel.JUNIOR,
      rankingResumeWeight: 80,
      rankingTestWeight: 30, // 80 + 30 = 110
    };

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
