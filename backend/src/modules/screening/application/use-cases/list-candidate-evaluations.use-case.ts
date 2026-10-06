import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Evaluation } from '@prisma/client';
import {
  IScreeningRepository,
  SCREENING_REPOSITORY,
} from '../../domain/screening.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';

@Injectable()
export class ListCandidateEvaluationsUseCase {
  constructor(
    @Inject(SCREENING_REPOSITORY)
    private readonly screeningRepository: IScreeningRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(candidateId: string): Promise<Evaluation[]> {
    const candidate = await this.candidatesRepository.findById(candidateId);
    if (!candidate) {
      throw new NotFoundException(`Candidato com ID '${candidateId}' não foi encontrado.`);
    }

    return this.screeningRepository.findByCandidateId(candidateId);
  }
}
