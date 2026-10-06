import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  Evaluation,
  CandidateTest,
  Recommendation,
  CandidateTestStatus,
  Job,
  JobStatus,
  ExperienceLevel,
  Candidate,
  CandidateStatus,
} from '@prisma/client';
import {
  RANKING_REPOSITORY,
  IRankingRepository,
} from '../src/modules/ranking/domain/ranking.repository.interface';
import {
  JOBS_REPOSITORY,
  IJobsRepository,
} from '../src/modules/jobs/domain/jobs.repository.interface';
import {
  CANDIDATES_REPOSITORY,
  ICandidatesRepository,
} from '../src/modules/candidates/domain/candidates.repository.interface';

const JOB_ID = 'aaaa0000-0000-4000-a000-000000000001';
const CAND_A = 'bbbb0000-0000-4000-a000-000000000001'; // resumeScore=9, testScore=10
const CAND_B = 'bbbb0000-0000-4000-a000-000000000002'; // resumeScore=7, no test

const makeEval = (candidateId: string, finalScore: number): Evaluation => ({
  id: `ev-${candidateId}`,
  candidateId,
  jobId: JOB_ID,
  resumeId: 'res-1',
  finalScore,
  educationScore: finalScore,
  automationScore: finalScore,
  dataScore: finalScore,
  experienceScore: finalScore,
  technologyScore: finalScore,
  behavioralScore: finalScore,
  strengths: [],
  gaps: [],
  justification: '',
  recommendation: Recommendation.APPROVED,
  promptVersion: 'v1',
  aiModel: 'fallback',
  rawAiResponse: '{}',
  createdAt: new Date(),
});

const makeCT = (candidateId: string, score: number): CandidateTest => ({
  id: `ct-${candidateId}`,
  candidateId,
  testId: 'test-1',
  score,
  status: CandidateTestStatus.GRADED,
  submittedAt: new Date(),
  gradedAt: new Date(),
  createdAt: new Date(),
});

class InMemoryRankingRepo implements IRankingRepository {
  async findEvaluationsByJobId(jobId: string): Promise<Evaluation[]> {
    if (jobId !== JOB_ID) return [];
    return [
      makeEval(CAND_A, 9.0),
      makeEval(CAND_B, 7.0),
    ].sort((a, b) => b.finalScore - a.finalScore);
  }

  async findCandidateTestsByJobId(jobId: string): Promise<CandidateTest[]> {
    if (jobId !== JOB_ID) return [];
    return [makeCT(CAND_A, 10.0)];
  }
}

class MockJobsRepo implements Partial<IJobsRepository> {
  async findById(id: string): Promise<Job | null> {
    if (id !== JOB_ID) return null;
    return {
      id: JOB_ID,
      title: 'Backend Engineer',
      description: 'desc',
      requirements: 'req',
      desiredSkills: [],
      experienceLevel: ExperienceLevel.MID,
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
}

class MockCandidatesRepo implements Partial<ICandidatesRepository> {
  private readonly candidates: Record<string, Candidate> = {
    [CAND_A]: {
      id: CAND_A,
      name: 'Ana Lima',
      email: 'ana@test.com',
      phone: null,
      status: CandidateStatus.TEST_APPROVED,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    [CAND_B]: {
      id: CAND_B,
      name: 'Bruno Costa',
      email: 'bruno@test.com',
      phone: null,
      status: CandidateStatus.SCREENING_APPROVED,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  async findById(id: string): Promise<Candidate | null> {
    return this.candidates[id] ?? null;
  }
}

describe('Ranking Module (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RANKING_REPOSITORY)
      .useValue(new InMemoryRankingRepo())
      .overrideProvider(JOBS_REPOSITORY)
      .useValue(new MockJobsRepo())
      .overrideProvider(CANDIDATES_REPOSITORY)
      .useValue(new MockCandidatesRepo())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  it('GET /api/v1/jobs/:jobId/ranking - deve retornar ranking ordenado por finalScore', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/jobs/${JOB_ID}/ranking`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);

    // CAND_A: 9.0 * 0.60 + 10.0 * 0.40 = 5.40 + 4.00 = 9.40
    expect(res.body[0].candidateId).toBe(CAND_A);
    expect(res.body[0].finalScore).toBe(9.40);
    expect(res.body[0].rankingPosition).toBe(1);
    expect(res.body[0].resumeScore).toBe(9.0);
    expect(res.body[0].testScore).toBe(10.0);

    // CAND_B: only resumeScore=7.0, no test
    expect(res.body[1].candidateId).toBe(CAND_B);
    expect(res.body[1].finalScore).toBe(7.0);
    expect(res.body[1].rankingPosition).toBe(2);
    expect(res.body[1].testScore).toBeNull();
  });

  it('GET /api/v1/jobs/:jobId/ranking/:candidateId - deve retornar posição de candidato específico', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/jobs/${JOB_ID}/ranking/${CAND_A}`)
      .expect(200);

    expect(res.body.candidateId).toBe(CAND_A);
    expect(res.body.rankingPosition).toBe(1);
    expect(res.body.finalScore).toBe(9.40);
  });

  it('GET /api/v1/jobs/:jobId/ranking - deve retornar 404 para vaga inexistente', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/jobs/00000000-0000-0000-0000-000000000000/ranking')
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
