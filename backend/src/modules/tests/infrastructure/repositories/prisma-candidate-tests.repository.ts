import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  ICandidateTestsRepository,
  CandidateTestWithAnswers,
  SubmitAnswerInput,
} from '../../domain/candidate-tests.repository.interface';
import { CandidateTest, CandidateTestStatus } from '@prisma/client';

@Injectable()
export class PrismaCandidateTestsRepository implements ICandidateTestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assign(candidateId: string, testId: string): Promise<CandidateTest> {
    return this.prisma.candidateTest.create({
      data: {
        candidateId,
        testId,
        status: CandidateTestStatus.PENDING,
      },
    });
  }

  async findById(id: string): Promise<CandidateTestWithAnswers | null> {
    return this.prisma.candidateTest.findUnique({
      where: { id },
      include: {
        answers: true,
      },
    });
  }

  async findByCandidateId(candidateId: string): Promise<CandidateTest[]> {
    return this.prisma.candidateTest.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTestId(testId: string): Promise<CandidateTest[]> {
    return this.prisma.candidateTest.findMany({
      where: { testId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCandidateAndTest(candidateId: string, testId: string): Promise<CandidateTest | null> {
    return this.prisma.candidateTest.findUnique({
      where: {
        candidateId_testId: {
          candidateId,
          testId,
        },
      },
    });
  }

  async updateStatus(id: string, status: CandidateTestStatus, score?: number): Promise<CandidateTest> {
    const data: any = { status };
    if (score !== undefined) {
      data.score = score;
      data.gradedAt = new Date();
    }
    if (status === CandidateTestStatus.SUBMITTED || status === CandidateTestStatus.GRADED) {
      data.submittedAt = new Date();
    }

    return this.prisma.candidateTest.update({
      where: { id },
      data,
    });
  }

  async submitAnswers(
    candidateTestId: string,
    answers: SubmitAnswerInput[],
  ): Promise<CandidateTestWithAnswers> {
    return this.prisma.$transaction(async (tx) => {
      // Upsert answers
      for (const ans of answers) {
        await tx.candidateAnswer.upsert({
          where: {
            candidateTestId_questionId: {
              candidateTestId,
              questionId: ans.questionId,
            },
          },
          update: {
            answerText: ans.answerText,
          },
          create: {
            candidateTestId,
            questionId: ans.questionId,
            answerText: ans.answerText,
          },
        });
      }

      return tx.candidateTest.findUniqueOrThrow({
        where: { id: candidateTestId },
        include: { answers: true },
      });
    });
  }
}
