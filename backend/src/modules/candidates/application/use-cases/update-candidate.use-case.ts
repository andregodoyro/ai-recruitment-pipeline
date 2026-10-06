import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { Candidate } from '@prisma/client';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../domain/candidates.repository.interface';
import { UpdateCandidateDto } from '../dtos/update-candidate.dto';

@Injectable()
export class UpdateCandidateUseCase {
  constructor(
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(id: string, dto: UpdateCandidateDto): Promise<Candidate> {
    const existing = await this.candidatesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Candidato com ID '${id}' não foi encontrado.`);
    }

    if (dto.email && dto.email !== existing.email) {
      const emailOccupied = await this.candidatesRepository.findByEmail(dto.email);
      if (emailOccupied && emailOccupied.id !== id) {
        throw new ConflictException(
          `Candidato com o e-mail '${dto.email}' já está cadastrado.`,
        );
      }
    }

    return this.candidatesRepository.update(id, dto);
  }
}
