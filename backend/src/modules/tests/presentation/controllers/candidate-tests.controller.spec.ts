import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CandidateTestsController } from './candidate-tests.controller';

describe('CandidateTestsController', () => {
  let controller: CandidateTestsController;
  let mockAssign: any;
  let mockSubmit: any;
  let mockGetCandidateTest: any;
  let mockCandidateTestsRepo: any;

  beforeEach(() => {
    mockAssign = { execute: vi.fn().mockResolvedValue({ id: 'ct-1', status: 'PENDING' }) };
    mockSubmit = { execute: vi.fn().mockResolvedValue({ id: 'ct-1', score: 9.0, status: 'GRADED' }) };
    mockGetCandidateTest = { execute: vi.fn().mockResolvedValue({ id: 'ct-1', answers: [] }) };
    mockCandidateTestsRepo = {
      findByCandidateId: vi.fn().mockResolvedValue([{ id: 'ct-1' }]),
    };

    controller = new CandidateTestsController(
      mockAssign,
      mockSubmit,
      mockGetCandidateTest,
      mockCandidateTestsRepo,
    );
  });

  it('deve chamar assignTestUseCase no POST /tests/:testId/assign/:candidateId', async () => {
    const res = await controller.assign('test-1', 'cand-1');
    expect(res).toEqual({ id: 'ct-1', status: 'PENDING' });
    expect(mockAssign.execute).toHaveBeenCalledWith('test-1', 'cand-1');
  });

  it('deve chamar getCandidateTestUseCase no GET /candidate-tests/:id', async () => {
    const res = await controller.findOne('ct-1');
    expect(res).toEqual({ id: 'ct-1', answers: [] });
    expect(mockGetCandidateTest.execute).toHaveBeenCalledWith('ct-1');
  });

  it('deve chamar submitAnswersUseCase no POST /candidate-tests/:id/submit', async () => {
    const dto = { answers: [{ questionId: 'q-1', answerText: 'Resp' }] };
    const res = await controller.submit('ct-1', dto);
    expect(res).toEqual({ id: 'ct-1', score: 9.0, status: 'GRADED' });
    expect(mockSubmit.execute).toHaveBeenCalledWith('ct-1', dto);
  });

  it('deve listar testes do candidato no GET /candidates/:candidateId/tests', async () => {
    const res = await controller.findByCandidate('cand-1');
    expect(res).toEqual([{ id: 'ct-1' }]);
    expect(mockCandidateTestsRepo.findByCandidateId).toHaveBeenCalledWith('cand-1');
  });
});
