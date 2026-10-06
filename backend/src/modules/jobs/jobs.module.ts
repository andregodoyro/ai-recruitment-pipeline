import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { JOBS_REPOSITORY } from './domain/jobs.repository.interface';
import { PrismaJobsRepository } from './infrastructure/repositories/prisma-jobs.repository';
import { CreateJobUseCase } from './application/use-cases/create-job.use-case';
import { GetJobUseCase } from './application/use-cases/get-job.use-case';
import { ListJobsUseCase } from './application/use-cases/list-jobs.use-case';
import { UpdateJobUseCase } from './application/use-cases/update-job.use-case';
import { UpdateJobStatusUseCase } from './application/use-cases/update-job-status.use-case';
import { DeleteJobUseCase } from './application/use-cases/delete-job.use-case';
import { JobsController } from './presentation/controllers/jobs.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [JobsController],
  providers: [
    {
      provide: JOBS_REPOSITORY,
      useClass: PrismaJobsRepository,
    },
    CreateJobUseCase,
    GetJobUseCase,
    ListJobsUseCase,
    UpdateJobUseCase,
    UpdateJobStatusUseCase,
    DeleteJobUseCase,
  ],
  exports: [
    JOBS_REPOSITORY,
    CreateJobUseCase,
    GetJobUseCase,
    ListJobsUseCase,
    UpdateJobUseCase,
    UpdateJobStatusUseCase,
    DeleteJobUseCase,
  ],
})
export class JobsModule {}
