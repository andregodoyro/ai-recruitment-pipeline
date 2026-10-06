import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { JobsModule } from '../jobs/jobs.module';
import { CandidatesModule } from '../candidates/candidates.module';

// Token
import { RANKING_REPOSITORY } from './domain/ranking.repository.interface';

// Prisma Repository
import { PrismaRankingRepository } from './infrastructure/repositories/prisma-ranking.repository';

// Use Cases
import { GetJobRankingUseCase } from './application/use-cases/get-job-ranking.use-case';
import { GetCandidateRankingPositionUseCase } from './application/use-cases/get-candidate-ranking-position.use-case';

// Controller
import { RankingController } from './presentation/controllers/ranking.controller';

/**
 * RankingModule — Cálculo e exibição do ranking de candidatos por vaga (ETAPA 6)
 *
 * O ranking é calculado on-demand (sem persistência) usando:
 *   finalScore = resumeScore × (rankingResumeWeight/100)
 *              + testScore   × (rankingTestWeight/100)
 *
 * Os pesos são configuráveis por vaga e já somam 100 (RN-01).
 * Candidatos sem teste têm apenas resumeScore considerado.
 */
@Module({
  imports: [DatabaseModule, JobsModule, CandidatesModule],
  controllers: [RankingController],
  providers: [
    {
      provide: RANKING_REPOSITORY,
      useClass: PrismaRankingRepository,
    },
    GetJobRankingUseCase,
    GetCandidateRankingPositionUseCase,
  ],
  exports: [GetJobRankingUseCase, GetCandidateRankingPositionUseCase],
})
export class RankingModule {}
