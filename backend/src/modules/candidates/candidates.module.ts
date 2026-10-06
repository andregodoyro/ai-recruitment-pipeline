import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { CANDIDATES_REPOSITORY } from './domain/candidates.repository.interface';
import { PrismaCandidatesRepository } from './infrastructure/repositories/prisma-candidates.repository';
import { CreateCandidateUseCase } from './application/use-cases/create-candidate.use-case';
import { GetCandidateUseCase } from './application/use-cases/get-candidate.use-case';
import { ListCandidatesUseCase } from './application/use-cases/list-candidates.use-case';
import { UpdateCandidateUseCase } from './application/use-cases/update-candidate.use-case';
import { DeleteCandidateUseCase } from './application/use-cases/delete-candidate.use-case';
import { CandidatesController } from './presentation/controllers/candidates.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CandidatesController],
  providers: [
    {
      provide: CANDIDATES_REPOSITORY,
      useClass: PrismaCandidatesRepository,
    },
    CreateCandidateUseCase,
    GetCandidateUseCase,
    ListCandidatesUseCase,
    UpdateCandidateUseCase,
    DeleteCandidateUseCase,
  ],
  exports: [
    CANDIDATES_REPOSITORY,
    CreateCandidateUseCase,
    GetCandidateUseCase,
    ListCandidatesUseCase,
    UpdateCandidateUseCase,
    DeleteCandidateUseCase,
  ],
})
export class CandidatesModule {}
