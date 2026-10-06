import { Injectable, Inject } from '@nestjs/common';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
  PaginatedJobsResult,
} from '../../domain/jobs.repository.interface';
import { ListJobsQueryDto } from '../dtos/list-jobs-query.dto';

@Injectable()
export class ListJobsUseCase {
  constructor(
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(query: ListJobsQueryDto): Promise<PaginatedJobsResult> {
    return this.jobsRepository.findAll(query);
  }
}
