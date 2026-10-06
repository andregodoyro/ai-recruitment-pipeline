import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { ResumesModule } from './modules/resumes/resumes.module';
import { ScreeningModule } from './modules/screening/screening.module';
import { TestsModule } from './modules/tests/tests.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './shared/health/health.module';

@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Infraestrutura compartilhada
    DatabaseModule,
    HealthModule,

    // Módulos de negócio
    JobsModule,
    CandidatesModule,
    ResumesModule,
    ScreeningModule,
    TestsModule,
    RankingModule,
    InterviewsModule,
    DashboardModule,
  ],
})
export class AppModule {}
