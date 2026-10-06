import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ICandidateTestsRepository,
  CANDIDATE_TESTS_REPOSITORY,
  CandidateTestWithAnswers,
} from '../../domain/candidate-tests.repository.interface';

@Injectable()
export class GetCandidateTestUseCase {
  constructor(
    @Inject(CANDIDATE_TESTS_REPOSITORY)
    private readonly candidateTestsRepository: ICandidateTestsRepository,
  ) {}

  async execute(id: string): Promise<CandidateTestWithAnswers> {
    const candidateTest = await this.candidateTestsRepository.findById(id);
    if (!candidateTest) {
      throw new NotFoundException(`Aplicação de teste com ID '${id}' não foi encontrada.`);
    }

    return candidateTest;
  }
}
