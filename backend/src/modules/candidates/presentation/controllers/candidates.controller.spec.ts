import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CandidatesController } from './candidates.controller';

describe('CandidatesController', () => {
  let controller: CandidatesController;
  let mockCreate: any;
  let mockGet: any;
  let mockList: any;
  let mockUpdate: any;
  let mockDelete: any;

  beforeEach(() => {
    mockCreate = { execute: vi.fn().mockResolvedValue({ id: 'c-1', name: 'Ana' }) };
    mockGet = { execute: vi.fn().mockResolvedValue({ id: 'c-1', name: 'Ana' }) };
    mockList = { execute: vi.fn().mockResolvedValue({ candidates: [], total: 0 }) };
    mockUpdate = { execute: vi.fn().mockResolvedValue({ id: 'c-1', name: 'Ana Editada' }) };
    mockDelete = { execute: vi.fn().mockResolvedValue(undefined) };

    controller = new CandidatesController(
      mockCreate,
      mockGet,
      mockList,
      mockUpdate,
      mockDelete,
    );
  });

  it('deve chamar createCandidateUseCase na criação', async () => {
    const dto = { name: 'Ana', email: 'ana@email.com' };
    const res = await controller.create(dto);
    expect(res).toEqual({ id: 'c-1', name: 'Ana' });
    expect(mockCreate.execute).toHaveBeenCalledWith(dto);
  });

  it('deve chamar listCandidatesUseCase na listagem', async () => {
    const query = { page: 1, limit: 10 };
    const res = await controller.findAll(query);
    expect(res).toEqual({ candidates: [], total: 0 });
    expect(mockList.execute).toHaveBeenCalledWith(query);
  });

  it('deve chamar getCandidateUseCase ao buscar por ID', async () => {
    const res = await controller.findOne('c-1');
    expect(res).toEqual({ id: 'c-1', name: 'Ana' });
    expect(mockGet.execute).toHaveBeenCalledWith('c-1');
  });

  it('deve chamar updateCandidateUseCase na edição', async () => {
    const dto = { name: 'Ana Editada' };
    const res = await controller.update('c-1', dto);
    expect(res).toEqual({ id: 'c-1', name: 'Ana Editada' });
    expect(mockUpdate.execute).toHaveBeenCalledWith('c-1', dto);
  });

  it('deve chamar deleteCandidateUseCase na remoção', async () => {
    await controller.remove('c-1');
    expect(mockDelete.execute).toHaveBeenCalledWith('c-1');
  });
});
