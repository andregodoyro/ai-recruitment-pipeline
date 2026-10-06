import { Injectable, Inject } from '@nestjs/common';
import {
  IInterviewsRepository,
  INTERVIEWS_REPOSITORY,
  ListInterviewsQuery,
  PaginatedInterviewsResult,
} from '../../domain/interviews.repository.interface';

@Injectable()
export class ListInterviewsUseCase {
  constructor(
    @Inject(INTERVIEWS_REPOSITORY)
    private readonly interviewsRepository: IInterviewsRepository,
  ) {}

  async execute(query: ListInterviewsQuery): Promise<PaginatedInterviewsResult> {
    return this.interviewsRepository.findAll(query);
  }
}
