import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Job } from '@prisma/client';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../domain/jobs.repository.interface';
import { CreateJobDto } from '../dtos/create-job.dto';

@Injectable()
export class CreateJobUseCase {
  constructor(
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(dto: CreateJobDto): Promise<Job> {
    const educationWeight = dto.educationWeight ?? 15;
    const automationWeight = dto.automationWeight ?? 20;
    const dataWeight = dto.dataWeight ?? 20;
    const experienceWeight = dto.experienceWeight ?? 20;
    const technologyWeight = dto.technologyWeight ?? 15;
    const behavioralWeight = dto.behavioralWeight ?? 10;

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

    const rankingResumeWeight = dto.rankingResumeWeight ?? 60;
    const rankingTestWeight = dto.rankingTestWeight ?? 40;
    const rankingSum = rankingResumeWeight + rankingTestWeight;

    if (Math.abs(rankingSum - 100) > 0.01) {
      throw new BadRequestException(
        `A soma dos pesos de ranking (currículo + teste) deve ser 100%. Soma atual: ${rankingSum}%`,
      );
    }

    return this.jobsRepository.create({
      ...dto,
      educationWeight,
      automationWeight,
      dataWeight,
      experienceWeight,
      technologyWeight,
      behavioralWeight,
      rankingResumeWeight,
      rankingTestWeight,
    });
  }
}
