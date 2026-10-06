import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Test, JobStatus } from '@prisma/client';
import {
  ITestsRepository,
  TESTS_REPOSITORY,
} from '../../domain/tests.repository.interface';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../../jobs/domain/jobs.repository.interface';
import { CreateTestDto } from '../dtos/create-test.dto';

@Injectable()
export class CreateTestUseCase {
  constructor(
    @Inject(TESTS_REPOSITORY)
    private readonly testsRepository: ITestsRepository,
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(dto: CreateTestDto): Promise<Test> {
    const job = await this.jobsRepository.findById(dto.jobId);
    if (!job) {
      throw new NotFoundException(`Vaga com ID '${dto.jobId}' não foi encontrada.`);
    }

    return this.testsRepository.create({
      jobId: dto.jobId,
      title: dto.title,
      description: dto.description,
    });
  }
}
