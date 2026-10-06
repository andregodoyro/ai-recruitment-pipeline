import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreeningController } from './screening.controller';

describe('ScreeningController', () => {
  let controller: ScreeningController;
  let mockEvaluate: any;
  let mockGet: any;
  let mockListJob: any;
  let mockListCandidate: any;

  beforeEach(() => {
    mockEvaluate = { execute: vi.fn().mockResolvedValue({ id: 'eval-1', finalScore: 8.5 }) };
    mockGet = { execute: vi.fn().mockResolvedValue({ id: 'eval-1', finalScore: 8.5 }) };
    mockListJob = { execute: vi.fn().mockResolvedValue([{ id: 'eval-1' }]) };
    mockListCandidate = { execute: vi.fn().mockResolvedValue([{ id: 'eval-1' }]) };

    controller = new ScreeningController(
      mockEvaluate,
      mockGet,
      mockListJob,
      mockListCandidate,
    );
  });

  it('deve chamar evaluateResumeUseCase no endpoint evaluate', async () => {
    const dto = { candidateId: 'c-1', jobId: 'j-1' };
    const res = await controller.evaluate(dto);
    expect(res).toEqual({ id: 'eval-1', finalScore: 8.5 });
    expect(mockEvaluate.execute).toHaveBeenCalledWith(dto);
  });

  it('deve buscar avaliação por ID', async () => {
    const res = await controller.findOne('eval-1');
    expect(res).toEqual({ id: 'eval-1', finalScore: 8.5 });
    expect(mockGet.execute).toHaveBeenCalledWith('eval-1');
  });

  it('deve listar avaliações por vaga', async () => {
    const res = await controller.findByJob('j-1');
    expect(res).toEqual([{ id: 'eval-1' }]);
    expect(mockListJob.execute).toHaveBeenCalledWith('j-1');
  });

  it('deve listar avaliações por candidato', async () => {
    const res = await controller.findByCandidate('c-1');
    expect(res).toEqual([{ id: 'eval-1' }]);
    expect(mockListCandidate.execute).toHaveBeenCalledWith('c-1');
  });
});
