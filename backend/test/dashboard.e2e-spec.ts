import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CandidateStatus, Job, JobStatus, ExperienceLevel } from '@prisma/client';
import {
  DASHBOARD_REPOSITORY,
  IDashboardRepository,
  DashboardOverview,
  DashboardFilterQuery,
} from '../src/modules/dashboard/domain/dashboard.repository.interface';
import {
  JOBS_REPOSITORY,
  IJobsRepository,
} from '../src/modules/jobs/domain/jobs.repository.interface';

const JOB_ID = '33333333-3333-4333-a333-333333333333';

class InMemoryDashboardRepo implements IDashboardRepository {
  async getOverview(filter?: DashboardFilterQuery): Promise<DashboardOverview> {
    return {
      metrics: {
        totalJobs: filter?.jobId ? 1 : 10,
        openJobs: filter?.jobId ? 1 : 6,
        totalCandidates: 50,
        totalResumes: 45,
        totalEvaluations: 40,
        totalTests: 30,
        totalInterviews: 15,
        conversionRateHiredPercentage: 8.0,
      },
      funnel: [
        { stage: CandidateStatus.NEW, label: 'Novos', count: 10, percentageOfTotal: 20 },
        { stage: CandidateStatus.SCREENING_APPROVED, label: 'Aprovados CV', count: 20, percentageOfTotal: 40 },
        { stage: CandidateStatus.TEST_APPROVED, label: 'Aprovados Teste', count: 15, percentageOfTotal: 30 },
        { stage: CandidateStatus.HIRED, label: 'Contratados', count: 4, percentageOfTotal: 8 },
      ],
      scoreDistribution: [
        { range: '0-2', resumeCount: 1, testCount: 0 },
        { range: '2-4', resumeCount: 3, testCount: 2 },
        { range: '4-6', resumeCount: 8, testCount: 5 },
        { range: '6-8', resumeCount: 18, testCount: 12 },
        { range: '8-10', resumeCount: 10, testCount: 11 },
      ],
      topCandidates: [
        {
          candidateId: 'cand-1',
          candidateName: 'Rodrigo Lima',
          candidateEmail: 'rodrigo@email.com',
          jobId: JOB_ID,
          jobTitle: 'Senior Fullstack Engineer',
          finalScore: 9.4,
          resumeScore: 9.0,
          testScore: 10.0,
          status: CandidateStatus.INTERVIEW,
        },
      ],
    };
  }
}

class MockJobsRepo implements Partial<IJobsRepository> {
  async findById(id: string): Promise<Job | null> {
    if (id === JOB_ID) {
      return {
        id: JOB_ID,
        title: 'Senior Fullstack Engineer',
        description: 'Vaga',
        requirements: 'TypeScript',
        desiredSkills: [],
        experienceLevel: ExperienceLevel.SENIOR,
        status: JobStatus.OPEN,
        educationWeight: 15,
        automationWeight: 20,
        dataWeight: 20,
        experienceWeight: 20,
        technologyWeight: 15,
        behavioralWeight: 10,
        rankingResumeWeight: 60,
        rankingTestWeight: 40,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  }
}

describe('Dashboard Module (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DASHBOARD_REPOSITORY)
      .useValue(new InMemoryDashboardRepo())
      .overrideProvider(JOBS_REPOSITORY)
      .useValue(new MockJobsRepo())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('GET /api/v1/dashboard/overview - deve retornar dados agregados do dashboard', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard/overview')
      .expect(200);

    expect(res.body.metrics).toBeDefined();
    expect(res.body.metrics.totalJobs).toBe(10);
    expect(res.body.funnel.length).toBe(4);
    expect(res.body.scoreDistribution.length).toBe(5);
    expect(res.body.topCandidates[0].finalScore).toBe(9.4);
  });

  it('GET /api/v1/dashboard/overview?jobId=... - deve filtrar por vaga existente', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/dashboard/overview?jobId=${JOB_ID}`)
      .expect(200);

    expect(res.body.metrics.totalJobs).toBe(1);
    expect(res.body.topCandidates[0].jobId).toBe(JOB_ID);
  });

  it('GET /api/v1/dashboard/overview?jobId=... - deve retornar 404 para vaga inexistente', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/dashboard/overview?jobId=00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
