import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { JobsModule } from '../jobs/jobs.module';
import { RESUMES_REPOSITORY } from './domain/resumes.repository.interface';
import { TEXT_EXTRACTOR } from './domain/services/text-extractor.interface';
import { PrismaResumesRepository } from './infrastructure/repositories/prisma-resumes.repository';
import { PdfTextExtractorService } from './infrastructure/services/pdf-text-extractor.service';
import { UploadResumeUseCase } from './application/use-cases/upload-resume.use-case';
import { GetResumeUseCase } from './application/use-cases/get-resume.use-case';
import { ListCandidateResumesUseCase } from './application/use-cases/list-candidate-resumes.use-case';
import { ResumesController } from './presentation/controllers/resumes.controller';

@Module({
  imports: [DatabaseModule, CandidatesModule, JobsModule],
  controllers: [ResumesController],
  providers: [
    {
      provide: RESUMES_REPOSITORY,
      useClass: PrismaResumesRepository,
    },
    {
      provide: TEXT_EXTRACTOR,
      useClass: PdfTextExtractorService,
    },
    UploadResumeUseCase,
    GetResumeUseCase,
    ListCandidateResumesUseCase,
  ],
  exports: [
    RESUMES_REPOSITORY,
    TEXT_EXTRACTOR,
    UploadResumeUseCase,
    GetResumeUseCase,
    ListCandidateResumesUseCase,
  ],
})
export class ResumesModule {}
