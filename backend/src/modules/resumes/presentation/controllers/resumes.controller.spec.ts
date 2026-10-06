import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResumesController } from './resumes.controller';
import { BadRequestException } from '@nestjs/common';

describe('ResumesController', () => {
  let controller: ResumesController;
  let mockUpload: any;
  let mockGet: any;
  let mockList: any;

  beforeEach(() => {
    mockUpload = { execute: vi.fn().mockResolvedValue({ id: 'r-1', fileName: 'cv.pdf' }) };
    mockGet = { execute: vi.fn().mockResolvedValue({ id: 'r-1', fileName: 'cv.pdf' }) };
    mockList = { execute: vi.fn().mockResolvedValue([{ id: 'r-1' }]) };

    controller = new ResumesController(mockUpload, mockGet, mockList);
  });

  it('deve fazer upload de currículo quando os parâmetros forem válidos', async () => {
    const mockFile = { originalname: 'cv.pdf', buffer: Buffer.from('abc') };
    const res = await controller.uploadResume('c-1', 'j-1', mockFile);
    expect(res).toEqual({ id: 'r-1', fileName: 'cv.pdf' });
    expect(mockUpload.execute).toHaveBeenCalledWith('c-1', 'j-1', mockFile);
  });

  it('deve lançar BadRequestException se jobId não for informado', async () => {
    const mockFile = { originalname: 'cv.pdf', buffer: Buffer.from('abc') };
    await expect(controller.uploadResume('c-1', '', mockFile)).rejects.toThrow(BadRequestException);
  });

  it('deve buscar currículo por ID', async () => {
    const res = await controller.findOne('r-1');
    expect(res).toEqual({ id: 'r-1', fileName: 'cv.pdf' });
    expect(mockGet.execute).toHaveBeenCalledWith('r-1');
  });

  it('deve listar currículos por candidato', async () => {
    const res = await controller.findByCandidate('c-1');
    expect(res).toEqual([{ id: 'r-1' }]);
    expect(mockList.execute).toHaveBeenCalledWith('c-1');
  });
});
