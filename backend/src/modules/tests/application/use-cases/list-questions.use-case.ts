import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Question } from '@prisma/client';
import {
  IQuestionsRepository,
  QUESTIONS_REPOSITORY,
} from '../../domain/questions.repository.interface';
import {
  ITestsRepository,
  TESTS_REPOSITORY,
} from '../../domain/tests.repository.interface';

@Injectable()
export class ListQuestionsUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(TESTS_REPOSITORY)
    private readonly testsRepository: ITestsRepository,
  ) {}

  async execute(testId: string): Promise<Question[]> {
    const test = await this.testsRepository.findById(testId);
    if (!test) {
      throw new NotFoundException(`Teste com ID '${testId}' não foi encontrado.`);
    }

    return this.questionsRepository.findByTestId(testId);
  }
}
