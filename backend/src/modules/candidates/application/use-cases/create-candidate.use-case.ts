import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { Candidate } from '@prisma/client';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../domain/candidates.repository.interface';
import { CreateCandidateDto } from '../dtos/create-candidate.dto';

@Injectable()
export class CreateCandidateUseCase {
  constructor(
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(dto: CreateCandidateDto): Promise<Candidate> {
    const existing = await this.candidatesRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        `Candidato com o e-mail '${dto.email}' já está cadastrado.`,
      );
    }

    return this.candidatesRepository.create(dto);
  }
}
