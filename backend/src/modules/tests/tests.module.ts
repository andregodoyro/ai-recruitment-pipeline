import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { JobsModule } from '../jobs/jobs.module';
import { CandidatesModule } from '../candidates/candidates.module';

// Tokens
import { TESTS_REPOSITORY } from './domain/tests.repository.interface';
import { QUESTIONS_REPOSITORY } from './domain/questions.repository.interface';
import { CANDIDATE_TESTS_REPOSITORY } from './domain/candidate-tests.repository.interface';

// Prisma Repositories
import { PrismaTestsRepository } from './infrastructure/repositories/prisma-tests.repository';
import { PrismaQuestionsRepository } from './infrastructure/repositories/prisma-questions.repository';
import { PrismaCandidateTestsRepository } from './infrastructure/repositories/prisma-candidate-tests.repository';

// Use Cases
import { CreateTestUseCase } from './application/use-cases/create-test.use-case';
import { GetTestUseCase } from './application/use-cases/get-test.use-case';
import { ListTestsUseCase } from './application/use-cases/list-tests.use-case';
import { UpdateTestUseCase } from './application/use-cases/update-test.use-case';
import { UpdateTestStatusUseCase } from './application/use-cases/update-test-status.use-case';
import { DeleteTestUseCase } from './application/use-cases/delete-test.use-case';

import { CreateQuestionUseCase } from './application/use-cases/create-question.use-case';
import { GetCandidateTestUseCase } from './application/use-cases/get-candidate-test.use-case';
import { ListQuestionsUseCase } from './application/use-cases/list-questions.use-case';
import { UpdateQuestionUseCase } from './application/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from './application/use-cases/delete-question.use-case';

import { AssignTestUseCase } from './application/use-cases/assign-test.use-case';
import { SubmitAnswersUseCase } from './application/use-cases/submit-answers.use-case';

// Controllers
import { TestsController } from './presentation/controllers/tests.controller';
import { CandidateTestsController } from './presentation/controllers/candidate-tests.controller';

/**
 * TestsModule — Módulo de testes técnicos, questões, aplicação e correção (ETAPA 5)
 */
@Module({
  imports: [DatabaseModule, JobsModule, CandidatesModule],
  controllers: [TestsController, CandidateTestsController],
  providers: [
    // Repository bindings
    {
      provide: TESTS_REPOSITORY,
      useClass: PrismaTestsRepository,
    },
    {
      provide: QUESTIONS_REPOSITORY,
      useClass: PrismaQuestionsRepository,
    },
    {
      provide: CANDIDATE_TESTS_REPOSITORY,
      useClass: PrismaCandidateTestsRepository,
    },
    // Test Use Cases
    CreateTestUseCase,
    GetTestUseCase,
    ListTestsUseCase,
    UpdateTestUseCase,
    UpdateTestStatusUseCase,
    DeleteTestUseCase,
    // Question Use Cases
    CreateQuestionUseCase,
    ListQuestionsUseCase,
    UpdateQuestionUseCase,
    DeleteQuestionUseCase,
    // Candidate Test Use Cases
    AssignTestUseCase,
    SubmitAnswersUseCase,
    GetCandidateTestUseCase,
  ],
  exports: [
    TESTS_REPOSITORY,
    QUESTIONS_REPOSITORY,
    CANDIDATE_TESTS_REPOSITORY,
    CreateTestUseCase,
    GetTestUseCase,
    ListTestsUseCase,
    AssignTestUseCase,
    SubmitAnswersUseCase,
    GetCandidateTestUseCase,
  ],
})
export class TestsModule {}
