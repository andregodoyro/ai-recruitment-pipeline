import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubmitAnswersUseCase } from './submit-answers.use-case';
import { CandidateStatus, CandidateTestStatus, QuestionType } from '@prisma/client';

describe('SubmitAnswersUseCase', () => {
  let useCase: SubmitAnswersUseCase;
  let mockCandidateTestsRepo: any;
  let mockQuestionsRepo: any;
  let mockCandidatesRepo: any;

  beforeEach(() => {
    mockCandidateTestsRepo = {
      findById: vi.fn().mockImplementation((id: string) => {
        if (id === 'ct-1') {
          return Promise.resolve({
            id: 'ct-1',
            testId: 'test-1',
            candidateId: 'cand-1',
            status: CandidateTestStatus.PENDING,
          });
        }
        if (id === 'ct-already-submitted') {
          return Promise.resolve({
            id: 'ct-already-submitted',
            testId: 'test-1',
            candidateId: 'cand-1',
            status: CandidateTestStatus.SUBMITTED,
          });
        }
        return Promise.resolve(null);
      }),
      submitAnswers: vi.fn().mockImplementation((candidateTestId: string, answers: any[]) =>
        Promise.resolve({
          id: candidateTestId,
          testId: 'test-1',
          candidateId: 'cand-1',
          status: CandidateTestStatus.PENDING,
          answers: answers.map((a, i) => ({ id: `ans-${i}`, ...a })),
        }),
      ),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };

    mockQuestionsRepo = {
      findByTestId: vi.fn().mockResolvedValue([
        {
          id: 'q-1',
          type: QuestionType.MULTIPLE_CHOICE,
          correctAnswer: 'A',
          weight: 1,
        },
        {
          id: 'q-2',
          type: QuestionType.TRUE_FALSE,
          correctAnswer: 'TRUE',
          weight: 1,
        },
      ]),
    };

    mockCandidatesRepo = {
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new SubmitAnswersUseCase(
      mockCandidateTestsRepo,
      mockQuestionsRepo,
      mockCandidatesRepo,
    );
  });

  it('deve submeter respostas, calcular nota 10.0 e atualizar candidato para TEST_APPROVED', async () => {
    const dto = {
      answers: [
        { questionId: 'q-1', answerText: 'A' },
        { questionId: 'q-2', answerText: 'TRUE' },
      ],
    };

    const res = await useCase.execute('ct-1', dto);

    expect(res).toBeDefined();
    expect(res.score).toBe(10);
    expect(res.status).toBe(CandidateTestStatus.GRADED);
    expect(mockCandidateTestsRepo.updateStatus).toHaveBeenCalledWith(
      'ct-1',
      CandidateTestStatus.GRADED,
      10,
    );
    expect(mockCandidatesRepo.updateStatus).toHaveBeenCalledWith(
      'cand-1',
      CandidateStatus.TEST_APPROVED,
    );
  });

  it('deve calcular nota proporcional e não atualizar para TEST_APPROVED quando < 7.0', async () => {
    const dto = {
      answers: [
        { questionId: 'q-1', answerText: 'A' },
        { questionId: 'q-2', answerText: 'FALSE' }, // Errou q-2
      ],
    };

    const res = await useCase.execute('ct-1', dto);

    expect(res.score).toBe(5);
    expect(res.status).toBe(CandidateTestStatus.GRADED);
    expect(mockCandidatesRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se a aplicação do teste não for encontrada', async () => {
    await expect(useCase.execute('ct-nao-existe', { answers: [] })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve lançar BadRequestException se o teste já foi submetido', async () => {
    await expect(
      useCase.execute('ct-already-submitted', { answers: [] }),
    ).rejects.toThrow(BadRequestException);
  });
});
