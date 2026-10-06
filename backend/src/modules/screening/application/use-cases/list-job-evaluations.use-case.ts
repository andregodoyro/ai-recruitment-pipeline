import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Evaluation } from '@prisma/client';
import {
  IScreeningRepository,
  SCREENING_REPOSITORY,
} from '../../domain/screening.repository.interface';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../../jobs/domain/jobs.repository.interface';

@Injectable()
export class ListJobEvaluationsUseCase {
  constructor(
    @Inject(SCREENING_REPOSITORY)
    private readonly screeningRepository: IScreeningRepository,
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(jobId: string): Promise<Evaluation[]> {
    const job = await this.jobsRepository.findById(jobId);
    if (!job) {
      throw new NotFoundException(`Vaga com ID '${jobId}' não foi encontrada.`);
    }

    return this.screeningRepository.findByJobId(jobId);
  }
}
