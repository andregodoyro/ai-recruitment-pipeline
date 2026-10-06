import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { JobsModule } from '../jobs/jobs.module';

// Token
import { INTERVIEWS_REPOSITORY } from './domain/interviews.repository.interface';

// Prisma Repository
import { PrismaInterviewsRepository } from './infrastructure/repositories/prisma-interviews.repository';

// Use Cases
import { CreateInterviewUseCase } from './application/use-cases/create-interview.use-case';
import { GetInterviewUseCase } from './application/use-cases/get-interview.use-case';
import { ListInterviewsUseCase } from './application/use-cases/list-interviews.use-case';
import { UpdateInterviewUseCase } from './application/use-cases/update-interview.use-case';
import { DeleteInterviewUseCase } from './application/use-cases/delete-interview.use-case';

// Controller
import { InterviewsController } from './presentation/controllers/interviews.controller';

/**
 * InterviewsModule — Agendamento e gestão de entrevistas (ETAPA 7)
 */
@Module({
  imports: [DatabaseModule, CandidatesModule, JobsModule],
  controllers: [InterviewsController],
  providers: [
    {
      provide: INTERVIEWS_REPOSITORY,
      useClass: PrismaInterviewsRepository,
    },
    CreateInterviewUseCase,
    GetInterviewUseCase,
    ListInterviewsUseCase,
    UpdateInterviewUseCase,
    DeleteInterviewUseCase,
  ],
  exports: [
    INTERVIEWS_REPOSITORY,
    CreateInterviewUseCase,
    GetInterviewUseCase,
    ListInterviewsUseCase,
    UpdateInterviewUseCase,
    DeleteInterviewUseCase,
  ],
})
export class InterviewsModule {}
