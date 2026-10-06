import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Job } from '@prisma/client';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../domain/jobs.repository.interface';
import { UpdateJobDto } from '../dtos/update-job.dto';

@Injectable()
export class UpdateJobUseCase {
  constructor(
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(id: string, dto: UpdateJobDto): Promise<Job> {
    const existingJob = await this.jobsRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundException(`Vaga com ID '${id}' não foi encontrada.`);
    }

    const educationWeight = dto.educationWeight ?? existingJob.educationWeight;
    const automationWeight = dto.automationWeight ?? existingJob.automationWeight;
    const dataWeight = dto.dataWeight ?? existingJob.dataWeight;
    const experienceWeight = dto.experienceWeight ?? existingJob.experienceWeight;
    const technologyWeight = dto.technologyWeight ?? existingJob.technologyWeight;
    const behavioralWeight = dto.behavioralWeight ?? existingJob.behavioralWeight;

    const evalSum =
      educationWeight +
      automationWeight +
      dataWeight +
      experienceWeight +
      technologyWeight +
      behavioralWeight;

    if (Math.abs(evalSum - 100) > 0.01) {
      throw new BadRequestException(
        `A soma dos pesos de avaliação da vaga deve ser 100%. Soma atual: ${evalSum}%`,
      );
    }

    const rankingResumeWeight = dto.rankingResumeWeight ?? existingJob.rankingResumeWeight;
    const rankingTestWeight = dto.rankingTestWeight ?? existingJob.rankingTestWeight;
    const rankingSum = rankingResumeWeight + rankingTestWeight;

    if (Math.abs(rankingSum - 100) > 0.01) {
      throw new BadRequestException(
        `A soma dos pesos de ranking (currículo + teste) deve ser 100%. Soma atual: ${rankingSum}%`,
      );
    }

    return this.jobsRepository.update(id, dto);
  }
}
