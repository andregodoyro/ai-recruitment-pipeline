import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobsController } from './jobs.controller';
import { ExperienceLevel, JobStatus } from '@prisma/client';

describe('JobsController', () => {
  let controller: JobsController;
  let mockCreateJobUseCase: any;
  let mockGetJobUseCase: any;
  let mockListJobsUseCase: any;
  let mockUpdateJobUseCase: any;
  let mockUpdateJobStatusUseCase: any;
  let mockDeleteJobUseCase: any;

  beforeEach(() => {
    mockCreateJobUseCase = { execute: vi.fn().mockResolvedValue({ id: 'job-1', title: 'Job 1' }) };
    mockGetJobUseCase = { execute: vi.fn().mockResolvedValue({ id: 'job-1', title: 'Job 1' }) };
    mockListJobsUseCase = { execute: vi.fn().mockResolvedValue({ jobs: [], total: 0 }) };
    mockUpdateJobUseCase = { execute: vi.fn().mockResolvedValue({ id: 'job-1', title: 'Updated Job' }) };
    mockUpdateJobStatusUseCase = { execute: vi.fn().mockResolvedValue({ id: 'job-1', status: JobStatus.CLOSED }) };
    mockDeleteJobUseCase = { execute: vi.fn().mockResolvedValue(undefined) };

    controller = new JobsController(
      mockCreateJobUseCase,
      mockGetJobUseCase,
      mockListJobsUseCase,
      mockUpdateJobUseCase,
      mockUpdateJobStatusUseCase,
      mockDeleteJobUseCase,
    );
  });

  it('deve chamar createJobUseCase na criao', async () => {
    const dto = {
      title: 'Dev NestJS',
      description: 'Desc',
      requirements: 'Req',
      experienceLevel: ExperienceLevel.SENIOR,
    };
    const res = await controller.create(dto as any);
    expect(res).toEqual({ id: 'job-1', title: 'Job 1' });
    expect(mockCreateJobUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('deve chamar listJobsUseCase na listagem', async () => {
    const query = { page: 1, limit: 10 };
    const res = await controller.findAll(query);
    expect(res).toEqual({ jobs: [], total: 0 });
    expect(mockListJobsUseCase.execute).toHaveBeenCalledWith(query);
  });

  it('deve chamar getJobUseCase ao buscar por ID', async () => {
    const res = await controller.findOne('job-1');
    expect(res).toEqual({ id: 'job-1', title: 'Job 1' });
    expect(mockGetJobUseCase.execute).toHaveBeenCalledWith('job-1');
  });

  it('deve chamar updateJobUseCase na atualizao', async () => {
    const dto = { title: 'Updated Job' };
    const res = await controller.update('job-1', dto);
    expect(res).toEqual({ id: 'job-1', title: 'Updated Job' });
    expect(mockUpdateJobUseCase.execute).toHaveBeenCalledWith('job-1', dto);
  });

  it('deve chamar updateJobStatusUseCase ao alterar status', async () => {
    const res = await controller.updateStatus('job-1', { status: JobStatus.CLOSED });
    expect(res).toEqual({ id: 'job-1', status: JobStatus.CLOSED });
    expect(mockUpdateJobStatusUseCase.execute).toHaveBeenCalledWith('job-1', JobStatus.CLOSED);
  });

  it('deve chamar deleteJobUseCase na remoo', async () => {
    await controller.remove('job-1');
    expect(mockDeleteJobUseCase.execute).toHaveBeenCalledWith('job-1');
  });
});
