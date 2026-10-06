import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../domain/candidates.repository.interface';

@Injectable()
export class DeleteCandidateUseCase {
  constructor(
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.candidatesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Candidato com ID '${id}' não foi encontrado.`);
    }

    await this.candidatesRepository.softDelete(id);
  }
}
