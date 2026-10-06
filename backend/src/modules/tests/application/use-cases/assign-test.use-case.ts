import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CandidateTest, CandidateStatus, TestStatus } from '@prisma/client';
import {
  ICandidateTestsRepository,
  CANDIDATE_TESTS_REPOSITORY,
} from '../../domain/candidate-tests.repository.interface';
import {
  ITestsRepository,
  TESTS_REPOSITORY,
} from '../../domain/tests.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';

@Injectable()
export class AssignTestUseCase {
  constructor(
    @Inject(CANDIDATE_TESTS_REPOSITORY)
    private readonly candidateTestsRepository: ICandidateTestsRepository,
    @Inject(TESTS_REPOSITORY)
    private readonly testsRepository: ITestsRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(testId: string, candidateId: string): Promise<CandidateTest> {
    const test = await this.testsRepository.findById(testId);
    if (!test) {
      throw new NotFoundException(`Teste com ID '${testId}' não foi encontrado.`);
    }

    if (test.status !== TestStatus.PUBLISHED) {
      throw new BadRequestException('Apenas testes com status PUBLISHED podem ser atribuídos a candidatos.');
    }

    const candidate = await this.candidatesRepository.findById(candidateId);
    if (!candidate) {
      throw new NotFoundException(`Candidato com ID '${candidateId}' não foi encontrado.`);
    }

    const existingAssignment = await this.candidateTestsRepository.findByCandidateAndTest(candidateId, testId);
    if (existingAssignment) {
      throw new ConflictException('Este teste já foi atribuído a este candidato.');
    }

    const assignedTest = await this.candidateTestsRepository.assign(candidateId, testId);

    // Update candidate status to TEST if applicable
    await this.candidatesRepository.updateStatus(candidateId, CandidateStatus.TEST);

    return assignedTest;
  }
}
