import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Job, JobStatus } from '@prisma/client';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../domain/jobs.repository.interface';

@Injectable()
export class UpdateJobStatusUseCase {
  constructor(
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(id: string, status: JobStatus): Promise<Job> {
    const existingJob = await this.jobsRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundException(`Vaga com ID '${id}' não foi encontrada.`);
    }

    return this.jobsRepository.updateStatus(id, status);
  }
}
