import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InterviewsController } from './interviews.controller';
import { InterviewStatus } from '@prisma/client';

describe('InterviewsController', () => {
  let controller: InterviewsController;
  let mockCreate: any;
  let mockGet: any;
  let mockList: any;
  let mockUpdate: any;
  let mockDelete: any;

  beforeEach(() => {
    mockCreate = {
      execute: vi.fn().mockResolvedValue({ id: 'int-1', status: InterviewStatus.SCHEDULED }),
    };
    mockGet = {
      execute: vi.fn().mockResolvedValue({ id: 'int-1', status: InterviewStatus.SCHEDULED }),
    };
    mockList = {
      execute: vi.fn().mockResolvedValue({ interviews: [], total: 0 }),
    };
    mockUpdate = {
      execute: vi.fn().mockResolvedValue({ id: 'int-1', status: InterviewStatus.CONFIRMED }),
    };
    mockDelete = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    controller = new InterviewsController(
      mockCreate,
      mockGet,
      mockList,
      mockUpdate,
      mockDelete,
    );
  });

  it('deve chamar createInterviewUseCase no POST /interviews', async () => {
    const dto = {
      candidateId: 'cand-1',
      jobId: 'job-1',
      scheduledAt: '2026-10-25T14:00:00.000Z',
    };
    const res = await controller.create(dto);
    expect(res).toEqual({ id: 'int-1', status: InterviewStatus.SCHEDULED });
    expect(mockCreate.execute).toHaveBeenCalledWith(dto);
  });

  it('deve chamar listInterviewsUseCase no GET /interviews', async () => {
    const query = { page: 1, limit: 10 };
    const res = await controller.findAll(query);
    expect(res).toEqual({ interviews: [], total: 0 });
    expect(mockList.execute).toHaveBeenCalledWith(query);
  });

  it('deve chamar updateInterviewUseCase no PATCH /interviews/:id', async () => {
    const dto = { status: InterviewStatus.CONFIRMED };
    const res = await controller.update('int-1', dto);
    expect(res.status).toBe(InterviewStatus.CONFIRMED);
    expect(mockUpdate.execute).toHaveBeenCalledWith('int-1', dto);
  });
});
