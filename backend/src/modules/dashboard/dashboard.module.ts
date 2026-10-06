import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { JobsModule } from '../jobs/jobs.module';

// Token
import { DASHBOARD_REPOSITORY } from './domain/dashboard.repository.interface';

// Prisma Repository
import { PrismaDashboardRepository } from './infrastructure/repositories/prisma-dashboard.repository';

// Use Cases
import { GetDashboardOverviewUseCase } from './application/use-cases/get-dashboard-overview.use-case';

// Controller
import { DashboardController } from './presentation/controllers/dashboard.controller';

/**
 * DashboardModule — Métricas, funil e indicadores gerais (ETAPA 8)
 */
@Module({
  imports: [DatabaseModule, JobsModule],
  controllers: [DashboardController],
  providers: [
    {
      provide: DASHBOARD_REPOSITORY,
      useClass: PrismaDashboardRepository,
    },
    GetDashboardOverviewUseCase,
  ],
  exports: [DASHBOARD_REPOSITORY, GetDashboardOverviewUseCase],
})
export class DashboardModule {}
