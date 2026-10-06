import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Job } from '@prisma/client';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../domain/jobs.repository.interface';

@Injectable()
export class GetJobUseCase {
  constructor(
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(id: string): Promise<Job> {
    const job = await this.jobsRepository.findById(id);
    if (!job) {
      throw new NotFoundException(`Vaga com ID '${id}' não foi encontrada.`);
    }
    return job;
  }
}
