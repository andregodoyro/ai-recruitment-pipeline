import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  IQuestionsRepository,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '../../domain/questions.repository.interface';
import { Question } from '@prisma/client';

@Injectable()
export class PrismaQuestionsRepository implements IQuestionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateQuestionInput): Promise<Question> {
    return this.prisma.question.create({
      data: {
        testId: data.testId,
        questionText: data.questionText,
        type: data.type,
        options: data.options ?? [],
        correctAnswer: data.correctAnswer,
        weight: data.weight ?? 1,
        order: data.order ?? 0,
      },
    });
  }

  async findById(id: string): Promise<Question | null> {
    return this.prisma.question.findUnique({
      where: { id },
    });
  }

  async findByTestId(testId: string): Promise<Question[]> {
    return this.prisma.question.findMany({
      where: { testId },
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, data: UpdateQuestionInput): Promise<Question> {
    return this.prisma.question.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.question.delete({
      where: { id },
    });
  }
}
