import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Question } from '@prisma/client';
import {
  IQuestionsRepository,
  QUESTIONS_REPOSITORY,
} from '../../domain/questions.repository.interface';
import { UpdateQuestionDto } from '../dtos/update-question.dto';

@Injectable()
export class UpdateQuestionUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
  ) {}

  async execute(id: string, dto: UpdateQuestionDto): Promise<Question> {
    const question = await this.questionsRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Questão com ID '${id}' não foi encontrada.`);
    }

    return this.questionsRepository.update(id, dto);
  }
}
