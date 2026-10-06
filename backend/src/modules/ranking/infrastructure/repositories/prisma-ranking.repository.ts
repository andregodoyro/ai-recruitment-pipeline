import { Injectable } from '@nestjs/common';
import { Evaluation, CandidateTest } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { IRankingRepository } from '../../domain/ranking.repository.interface';

@Injectable()
export class PrismaRankingRepository implements IRankingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEvaluationsByJobId(jobId: string): Promise<Evaluation[]> {
    return this.prisma.evaluation.findMany({
      where: { jobId },
      orderBy: { finalScore: 'desc' },
    });
  }

  async findCandidateTestsByJobId(jobId: string): Promise<CandidateTest[]> {
    // CandidateTests are linked to Tests, which are linked to Jobs
    return this.prisma.candidateTest.findMany({
      where: {
        test: { jobId },
        status: { in: ['GRADED', 'SUBMITTED'] },
      },
      orderBy: { score: 'desc' },
    });
  }
}
