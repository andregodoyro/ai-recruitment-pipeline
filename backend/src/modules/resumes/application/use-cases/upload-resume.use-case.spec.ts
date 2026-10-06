import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UploadResumeUseCase } from './upload-resume.use-case';
import { CandidateStatus } from '@prisma/client';

describe('UploadResumeUseCase', () => {
  let useCase: UploadResumeUseCase;
  let mockResumesRepo: any;
  let mockCandidatesRepo: any;
  let mockJobsRepo: any;
  let mockTextExtractor: any;

  beforeEach(() => {
    mockResumesRepo = {
      deactivatePreviousResumes: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'resume-1',
          ...data,
          uploadedAt: new Date(),
        }),
      ),
    };
    mockCandidatesRepo = {
      findById: vi.fn().mockImplementation((id) => {
        if (id === 'c-1') return Promise.resolve({ id: 'c-1', status: CandidateStatus.NEW });
        return Promise.resolve(null);
      }),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };
    mockJobsRepo = {
      findById: vi.fn().mockImplementation((id) => {
        if (id === 'j-1') return Promise.resolve({ id: 'j-1', title: 'Job Dev' });
        return Promise.resolve(null);
      }),
    };
    mockTextExtractor = {
      extractText: vi.fn().mockResolvedValue('Texto extraído do CV'),
    };

    useCase = new UploadResumeUseCase(
      mockResumesRepo,
      mockCandidatesRepo,
      mockJobsRepo,
      mockTextExtractor,
    );
  });

  it('deve fazer upload de currículo e alterar status do candidato para SCREENING', async () => {
    const mockFile = {
      originalname: 'curriculo.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('dummy pdf'),
    };

    const result = await useCase.execute('c-1', 'j-1', mockFile);

    expect(result).toBeDefined();
    expect(result.id).toBe('resume-1');
    expect(result.extractedText).toBe('Texto extraído do CV');
    expect(mockCandidatesRepo.updateStatus).toHaveBeenCalledWith('c-1', CandidateStatus.SCREENING);
    expect(mockResumesRepo.deactivatePreviousResumes).toHaveBeenCalledWith('c-1', 'j-1');
  });

  it('deve lançar BadRequestException se o arquivo for omisso', async () => {
    await expect(useCase.execute('c-1', 'j-1', null as any)).rejects.toThrow(BadRequestException);
  });

  it('deve lançar NotFoundException se candidato não existir', async () => {
    const mockFile = {
      originalname: 'cv.pdf',
      mimetype: 'application/pdf',
      size: 500,
      buffer: Buffer.from('data'),
    };
    await expect(useCase.execute('invalid-c', 'j-1', mockFile)).rejects.toThrow(NotFoundException);
  });
});
