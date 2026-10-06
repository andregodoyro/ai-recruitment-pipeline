import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IQuestionsRepository,
  QUESTIONS_REPOSITORY,
} from '../../domain/questions.repository.interface';

@Injectable()
export class DeleteQuestionUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const question = await this.questionsRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Questão com ID '${id}' não foi encontrada.`);
    }

    await this.questionsRepository.delete(id);
  }
}
