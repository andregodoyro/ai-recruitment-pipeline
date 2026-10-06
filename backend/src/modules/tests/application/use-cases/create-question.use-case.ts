import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Question, QuestionType } from '@prisma/client';
import {
  IQuestionsRepository,
  QUESTIONS_REPOSITORY,
} from '../../domain/questions.repository.interface';
import {
  ITestsRepository,
  TESTS_REPOSITORY,
} from '../../domain/tests.repository.interface';
import { CreateQuestionDto } from '../dtos/create-question.dto';

@Injectable()
export class CreateQuestionUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(TESTS_REPOSITORY)
    private readonly testsRepository: ITestsRepository,
  ) {}

  async execute(testId: string, dto: CreateQuestionDto): Promise<Question> {
    const test = await this.testsRepository.findById(testId);
    if (!test) {
      throw new NotFoundException(`Teste com ID '${testId}' não foi encontrado.`);
    }

    if (
      dto.type === QuestionType.MULTIPLE_CHOICE ||
      dto.type === QuestionType.TRUE_FALSE
    ) {
      if (!dto.options || dto.options.length === 0) {
        throw new BadRequestException(
          `Questões do tipo ${dto.type} devem conter pelo menos uma opção.`,
        );
      }
      if (!dto.correctAnswer) {
        throw new BadRequestException(
          `Questões do tipo ${dto.type} devem especificar correctAnswer.`,
        );
      }
    }

    return this.questionsRepository.create({
      testId,
      questionText: dto.questionText,
      type: dto.type,
      options: dto.options,
      correctAnswer: dto.correctAnswer,
      weight: dto.weight ?? 1,
      order: dto.order ?? 0,
    });
  }
}
