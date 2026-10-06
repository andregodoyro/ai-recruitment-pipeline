import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { JobsModule } from '../jobs/jobs.module';
import { ResumesModule } from '../resumes/resumes.module';
import { SCREENING_REPOSITORY } from './domain/screening.repository.interface';
import { AI_RECRUITMENT_EVALUATOR } from '../../ai/interfaces/ai-evaluator.interface';
import { PrismaScreeningRepository } from './infrastructure/repositories/prisma-screening.repository';
import { OpenAiEvaluatorService } from '../../ai/services/openai-evaluator.service';
import { EvaluateResumeUseCase } from './application/use-cases/evaluate-resume.use-case';
import { GetEvaluationUseCase } from './application/use-cases/get-evaluation.use-case';
import { ListJobEvaluationsUseCase } from './application/use-cases/list-job-evaluations.use-case';
import { ListCandidateEvaluationsUseCase } from './application/use-cases/list-candidate-evaluations.use-case';
import { ScreeningController } from './presentation/controllers/screening.controller';

@Module({
  imports: [DatabaseModule, CandidatesModule, JobsModule, ResumesModule],
  controllers: [ScreeningController],
  providers: [
    {
      provide: SCREENING_REPOSITORY,
      useClass: PrismaScreeningRepository,
    },
    {
      provide: AI_RECRUITMENT_EVALUATOR,
      useClass: OpenAiEvaluatorService,
    },
    EvaluateResumeUseCase,
    GetEvaluationUseCase,
    ListJobEvaluationsUseCase,
    ListCandidateEvaluationsUseCase,
  ],
  exports: [
    SCREENING_REPOSITORY,
    AI_RECRUITMENT_EVALUATOR,
    EvaluateResumeUseCase,
    GetEvaluationUseCase,
    ListJobEvaluationsUseCase,
    ListCandidateEvaluationsUseCase,
  ],
})
export class ScreeningModule {}
