import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  Interview,
  InterviewStatus,
  Candidate,
  CandidateStatus,
  Job,
  JobStatus,
  ExperienceLevel,
} from '@prisma/client';
import {
  INTERVIEWS_REPOSITORY,
  IInterviewsRepository,
  CreateInterviewInput,
  UpdateInterviewInput,
  ListInterviewsQuery,
  PaginatedInterviewsResult,
} from '../src/modules/interviews/domain/interviews.repository.interface';
import {
  CANDIDATES_REPOSITORY,
  ICandidatesRepository,
} from '../src/modules/candidates/domain/candidates.repository.interface';
import {
  JOBS_REPOSITORY,
  IJobsRepository,
} from '../src/modules/jobs/domain/jobs.repository.interface';

const JOB_ID = '11111111-2222-4333-8444-555555555555';
const CAND_APPROVED_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const CAND_REJECTED_ID = '99999999-8888-4777-8666-555555555555';

class InMemoryInterviewsRepo implements IInterviewsRepository {
  private interviews: Interview[] = [];

  async create(data: CreateInterviewInput): Promise<Interview> {
    const interview: Interview = {
      id: crypto.randomUUID(),
      candidateId: data.candidateId,
      jobId: data.jobId,
      scheduledAt: data.scheduledAt,
      meetingUrl: data.meetingUrl ?? null,
      notes: data.notes ?? null,
      status: InterviewStatus.SCHEDULED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.interviews.push(interview);
    return interview;
  }

  async findById(id: string): Promise<Interview | null> {
    return this.interviews.find((i) => i.id === id) ?? null;
  }

  async findAll(query: ListInterviewsQuery): Promise<PaginatedInterviewsResult> {
    let list = [...this.interviews];
    if (query.jobId) list = list.filter((i) => i.jobId === query.jobId);
    if (query.candidateId) list = list.filter((i) => i.candidateId === query.candidateId);
    if (query.status) list = list.filter((i) => i.status === query.status);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return {
      interviews: list.slice((page - 1) * limit, page * limit),
      total: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit) || 1,
    };
  }

  async findByJobId(jobId: string): Promise<Interview[]> {
    return this.interviews.filter((i) => i.jobId === jobId);
  }

  async findByCandidateId(candidateId: string): Promise<Interview[]> {
    return this.interviews.filter((i) => i.candidateId === candidateId);
  }

  async update(id: string, data: UpdateInterviewInput): Promise<Interview> {
    const idx = this.interviews.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Not found');
    this.interviews[idx] = {
      ...this.interviews[idx],
      ...data,
      updatedAt: new Date(),
    };
    return this.interviews[idx];
  }

  async updateStatus(id: string, status: InterviewStatus): Promise<Interview> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    this.interviews = this.interviews.filter((i) => i.id !== id);
  }
}

class MockJobsRepo implements Partial<IJobsRepository> {
  async findById(id: string): Promise<Job | null> {
    if (id === JOB_ID) {
      return {
        id: JOB_ID,
        title: 'Backend Specialist',
        description: 'Vaga para backend',
        requirements: 'Node.js, PostgreSQL',
        desiredSkills: ['NestJS'],
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

class MockCandidatesRepo implements Partial<ICandidatesRepository> {
  private candidates: Record<string, Candidate> = {
    [CAND_APPROVED_ID]: {
      id: CAND_APPROVED_ID,
      name: 'Gabriel Martins',
      email: 'gabriel@email.com',
      phone: null,
      status: CandidateStatus.TEST_APPROVED,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    [CAND_REJECTED_ID]: {
      id: CAND_REJECTED_ID,
      name: 'Lucas Ferreira',
      email: 'lucas@email.com',
      phone: null,
      status: CandidateStatus.TEST,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  async findById(id: string): Promise<Candidate | null> {
    return this.candidates[id] ?? null;
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    if (this.candidates[id]) {
      this.candidates[id].status = status;
      return this.candidates[id];
    }
    throw new Error('Candidate not found');
  }
}

describe('Interviews Module (e2e)', () => {
  let app: INestApplication<App>;
  let createdInterviewId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(INTERVIEWS_REPOSITORY)
      .useValue(new InMemoryInterviewsRepo())
      .overrideProvider(CANDIDATES_REPOSITORY)
      .useValue(new MockCandidatesRepo())
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

  it('POST /api/v1/interviews - deve rejeitar agendamento se candidato não tem TEST_APPROVED (400)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/interviews')
      .send({
        candidateId: CAND_REJECTED_ID,
        jobId: JOB_ID,
        scheduledAt: '2026-10-25T15:00:00.000Z',
      })
      .expect(400);
  });

  it('POST /api/v1/interviews - deve agendar com sucesso quando TEST_APPROVED (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/interviews')
      .send({
        candidateId: CAND_APPROVED_ID,
        jobId: JOB_ID,
        scheduledAt: '2026-10-25T15:00:00.000Z',
        meetingUrl: 'https://meet.google.com/test-meet-123',
        notes: 'Entrevista técnica comportamental',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe(InterviewStatus.SCHEDULED);
    expect(res.body.candidateId).toBe(CAND_APPROVED_ID);
    createdInterviewId = res.body.id;
  });

  it('GET /api/v1/interviews/:id - deve consultar os detalhes da entrevista', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/interviews/${createdInterviewId}`)
      .expect(200);

    expect(res.body.id).toBe(createdInterviewId);
    expect(res.body.notes).toBe('Entrevista técnica comportamental');
  });

  it('PATCH /api/v1/interviews/:id - deve atualizar status para CONFIRMED', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/interviews/${createdInterviewId}`)
      .send({ status: InterviewStatus.CONFIRMED })
      .expect(200);

    expect(res.body.status).toBe(InterviewStatus.CONFIRMED);
  });

  it('GET /api/v1/jobs/:jobId/interviews - deve listar entrevistas da vaga', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/jobs/${JOB_ID}/interviews`)
      .expect(200);

    expect(Array.isArray(res.body.interviews)).toBe(true);
    expect(res.body.interviews.length).toBe(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
