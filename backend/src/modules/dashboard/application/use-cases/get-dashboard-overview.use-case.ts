import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IDashboardRepository,
  DASHBOARD_REPOSITORY,
  DashboardOverview,
} from '../../domain/dashboard.repository.interface';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../../jobs/domain/jobs.repository.interface';
import { DashboardFilterDto } from '../dtos/dashboard-filter.dto';

@Injectable()
export class GetDashboardOverviewUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(dto?: DashboardFilterDto): Promise<DashboardOverview> {
    if (dto?.jobId) {
      const job = await this.jobsRepository.findById(dto.jobId);
      if (!job) {
        throw new NotFoundException(`Vaga com ID '${dto.jobId}' não foi encontrada.`);
      }
    }

    return this.dashboardRepository.getOverview({
      jobId: dto?.jobId,
      startDate: dto?.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto?.endDate ? new Date(dto.endDate) : undefined,
    });
  }
}
