import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateQuestionUseCase } from './create-question.use-case';
import { QuestionType } from '@prisma/client';

describe('CreateQuestionUseCase', () => {
  let useCase: CreateQuestionUseCase;
  let mockQuestionsRepo: any;
  let mockTestsRepo: any;

  beforeEach(() => {
    mockQuestionsRepo = {
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'question-1',
          ...data,
        }),
      ),
    };
    mockTestsRepo = {
      findById: vi.fn().mockImplementation((id: string) => {
        if (id === 'test-1') {
          return Promise.resolve({ id: 'test-1', title: 'Prova de Conceito' });
        }
        return Promise.resolve(null);
      }),
    };

    useCase = new CreateQuestionUseCase(mockQuestionsRepo, mockTestsRepo);
  });

  it('deve criar uma questão de múltipla escolha com opções e resposta correta', async () => {
    const dto = {
      questionText: 'Qual o valor padrão de portas HTTP?',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['80', '443', '8080'],
      correctAnswer: '80',
      weight: 1.5,
      order: 1,
    };

    const res = await useCase.execute('test-1', dto);

    expect(res).toBeDefined();
    expect(res.id).toBe('question-1');
    expect(res.questionText).toBe(dto.questionText);
    expect(mockQuestionsRepo.create).toHaveBeenCalledWith({
      testId: 'test-1',
      ...dto,
    });
  });

  it('deve lançar NotFoundException se o teste não existir', async () => {
    const dto = {
      questionText: 'Questão órfã',
      type: QuestionType.OPEN_TEXT,
    };

    await expect(useCase.execute('test-invalido', dto)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException para múltipla escolha sem opções', async () => {
    const dto = {
      questionText: 'Questão sem alternativas',
      type: QuestionType.MULTIPLE_CHOICE,
      options: [],
      correctAnswer: 'A',
    };

    await expect(useCase.execute('test-1', dto)).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException para múltipla escolha sem correctAnswer', async () => {
    const dto = {
      questionText: 'Questão sem gabarito',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['A', 'B'],
    };

    await expect(useCase.execute('test-1', dto)).rejects.toThrow(BadRequestException);
  });
});
