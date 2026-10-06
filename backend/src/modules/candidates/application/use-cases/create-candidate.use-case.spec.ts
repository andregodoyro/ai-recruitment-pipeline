import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { CreateCandidateUseCase } from './create-candidate.use-case';
import { ICandidatesRepository } from '../../domain/candidates.repository.interface';
import { CandidateStatus } from '@prisma/client';

describe('CreateCandidateUseCase', () => {
  let useCase: CreateCandidateUseCase;
  let mockRepository: Partial<ICandidatesRepository>;

  beforeEach(() => {
    mockRepository = {
      findByEmail: vi.fn().mockImplementation((email: string) => {
        if (email === 'duplicate@email.com') {
          return Promise.resolve({
            id: 'candidate-1',
            name: 'Dup',
            email: 'duplicate@email.com',
            phone: null,
            status: CandidateStatus.NEW,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      }),
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'candidate-new',
          ...data,
          phone: data.phone ?? null,
          status: CandidateStatus.NEW,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    };
    useCase = new CreateCandidateUseCase(mockRepository as ICandidatesRepository);
  });

  it('deve cadastrar um candidato com sucesso', async () => {
    const dto = { name: 'João Santos', email: 'joao.santos@email.com' };
    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.id).toBe('candidate-new');
    expect(result.email).toBe('joao.santos@email.com');
    expect(mockRepository.create).toHaveBeenCalledOnce();
  });

  it('deve lançar ConflictException se o e-mail já estiver em uso', async () => {
    const dto = { name: 'Duplicado', email: 'duplicate@email.com' };
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
