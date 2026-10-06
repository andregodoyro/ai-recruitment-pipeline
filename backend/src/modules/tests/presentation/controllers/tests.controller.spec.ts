import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestsController } from './tests.controller';
import { TestStatus } from '@prisma/client';

describe('TestsController', () => {
  let controller: TestsController;
  let mockCreateTest: any;
  let mockGetTest: any;
  let mockListTests: any;
  let mockUpdateTest: any;
  let mockUpdateStatus: any;
  let mockDeleteTest: any;
  let mockCreateQuestion: any;
  let mockListQuestions: any;
  let mockUpdateQuestion: any;
  let mockDeleteQuestion: any;

  beforeEach(() => {
    mockCreateTest = { execute: vi.fn().mockResolvedValue({ id: 'test-1', title: 'Teste 1' }) };
    mockGetTest = { execute: vi.fn().mockResolvedValue({ id: 'test-1', title: 'Teste 1' }) };
    mockListTests = { execute: vi.fn().mockResolvedValue({ tests: [], total: 0 }) };
    mockUpdateTest = { execute: vi.fn().mockResolvedValue({ id: 'test-1', title: 'Teste Atualizado' }) };
    mockUpdateStatus = { execute: vi.fn().mockResolvedValue({ id: 'test-1', status: TestStatus.PUBLISHED }) };
    mockDeleteTest = { execute: vi.fn().mockResolvedValue(undefined) };
    mockCreateQuestion = { execute: vi.fn().mockResolvedValue({ id: 'q-1' }) };
    mockListQuestions = { execute: vi.fn().mockResolvedValue([{ id: 'q-1' }]) };
    mockUpdateQuestion = { execute: vi.fn().mockResolvedValue({ id: 'q-1' }) };
    mockDeleteQuestion = { execute: vi.fn().mockResolvedValue(undefined) };

    controller = new TestsController(
      mockCreateTest,
      mockGetTest,
      mockListTests,
      mockUpdateTest,
      mockUpdateStatus,
      mockDeleteTest,
      mockCreateQuestion,
      mockListQuestions,
      mockUpdateQuestion,
      mockDeleteQuestion,
    );
  });

  it('deve chamar createTestUseCase no POST /tests', async () => {
    const dto = { jobId: 'job-1', title: 'Teste' };
    const res = await controller.create(dto);
    expect(res).toEqual({ id: 'test-1', title: 'Teste 1' });
    expect(mockCreateTest.execute).toHaveBeenCalledWith(dto);
  });

  it('deve chamar listTestsUseCase no GET /tests', async () => {
    const query = { page: 1, limit: 10 };
    const res = await controller.findAll(query);
    expect(res).toEqual({ tests: [], total: 0 });
    expect(mockListTests.execute).toHaveBeenCalledWith(query);
  });

  it('deve chamar updateTestStatusUseCase no PATCH /tests/:id/status', async () => {
    const res = await controller.updateStatus('test-1', { status: TestStatus.PUBLISHED });
    expect(res.status).toBe(TestStatus.PUBLISHED);
    expect(mockUpdateStatus.execute).toHaveBeenCalledWith('test-1', TestStatus.PUBLISHED);
  });

  it('deve chamar addQuestion no POST /tests/:testId/questions', async () => {
    const dto = { questionText: 'Pergunta?', type: 'OPEN_TEXT' as any };
    const res = await controller.addQuestion('test-1', dto);
    expect(res).toEqual({ id: 'q-1' });
    expect(mockCreateQuestion.execute).toHaveBeenCalledWith('test-1', dto);
  });
});
