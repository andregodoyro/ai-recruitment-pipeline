import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../domain/jobs.repository.interface';

@Injectable()
export class DeleteJobUseCase {
  constructor(
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existingJob = await this.jobsRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundException(`Vaga com ID '${id}' não foi encontrada.`);
    }

    await this.jobsRepository.softDelete(id);
  }
}
