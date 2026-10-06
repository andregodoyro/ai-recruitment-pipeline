import { Injectable, Inject } from '@nestjs/common';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
  PaginatedCandidatesResult,
} from '../../domain/candidates.repository.interface';
import { ListCandidatesQueryDto } from '../dtos/list-candidates-query.dto';

@Injectable()
export class ListCandidatesUseCase {
  constructor(
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(query: ListCandidatesQueryDto): Promise<PaginatedCandidatesResult> {
    return this.candidatesRepository.findAll(query);
  }
}
