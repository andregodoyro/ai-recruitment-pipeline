import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Candidate } from '@prisma/client';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../domain/candidates.repository.interface';

@Injectable()
export class GetCandidateUseCase {
  constructor(
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(id: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findById(id);
    if (!candidate) {
      throw new NotFoundException(`Candidato com ID '${id}' não foi encontrado.`);
    }
    return candidate;
  }
}
