import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Resume } from '@prisma/client';
import {
  IResumesRepository,
  RESUMES_REPOSITORY,
} from '../../domain/resumes.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';

@Injectable()
export class ListCandidateResumesUseCase {
  constructor(
    @Inject(RESUMES_REPOSITORY)
    private readonly resumesRepository: IResumesRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(candidateId: string): Promise<Resume[]> {
    const candidate = await this.candidatesRepository.findById(candidateId);
    if (!candidate) {
      throw new NotFoundException(`Candidato com ID '${candidateId}' não foi encontrado.`);
    }

    return this.resumesRepository.findByCandidateId(candidateId);
  }
}
