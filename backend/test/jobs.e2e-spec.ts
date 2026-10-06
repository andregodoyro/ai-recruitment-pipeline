import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ExperienceLevel, JobStatus, Job } from '@prisma/client';
import { JOBS_REPOSITORY, IJobsRepository, CreateJobInput, UpdateJobInput, ListJobsQuery, PaginatedJobsResult } from '../src/modules/jobs/domain/jobs.repository.interface';

class InMemoryJobsRepository implements IJobsRepository {
  private jobs: Job[] = [];

  async create(data: CreateJobInput): Promise<Job> {
    const job: Job = {
      id: `job-${Date.now()}-${Math.random()}`,
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      desiredSkills: data.desiredSkills ?? [],
      experienceLevel: data.experienceLevel,
      status: JobStatus.OPEN,
      educationWeight: data.educationWeight ?? 15,
      automationWeight: data.automationWeight ?? 20,
      dataWeight: data.dataWeight ?? 20,
      experienceWeight: data.experienceWeight ?? 20,
      technologyWeight: data.technologyWeight ?? 15,
      behavioralWeight: data.behavioralWeight ?? 10,
      rankingResumeWeight: data.rankingResumeWeight ?? 60,
      rankingTestWeight: data.rankingTestWeight ?? 40,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.push(job);
    return job;
  }

  async findById(id: string): Promise<Job | null> {
    const job = this.jobs.find((j) => j.id === id && !j.deletedAt);
    return job ?? null;
  }

  async findAll(query: ListJobsQuery): Promise<PaginatedJobsResult> {
    let activeJobs = this.jobs.filter((j) => !j.deletedAt);
    if (query.status) {
      activeJobs = activeJobs.filter((j) => j.status === query.status);
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const total = activeJobs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      jobs: activeJobs.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: string, data: UpdateJobInput): Promise<Job> {
    const index = this.jobs.findIndex((j) => j.id === id);
    if (index === -1) throw new Error('Not found');
    this.jobs[index] = {
      ...this.jobs[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.jobs[index];
  }

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    return this.update(id, { status });
  }

  async softDelete(id: string): Promise<void> {
    const index = this.jobs.findIndex((j) => j.id === id);
    if (index !== -1) {
      this.jobs[index].deletedAt = new Date();
    }
  }
}

describe('JobsController (e2e)', () => {
  let app: INestApplication<App>;
  let createdJobId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JOBS_REPOSITORY)
      .useValue(new InMemoryJobsRepository())
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

  it('POST /api/v1/jobs - deve criar uma vaga com sucesso', async () => {
    const payload = {
      title: 'Desenvolvedor Fullstack Sr',
      description: 'Desenvolvimento de APIs NestJS e interfaces Next.js',
      requirements: 'TypeScript, NestJS, Next.js, PostgreSQL',
      desiredSkills: ['Docker', 'AWS'],
      experienceLevel: ExperienceLevel.SENIOR,
      educationWeight: 15,
      automationWeight: 20,
      dataWeight: 20,
      experienceWeight: 20,
      technologyWeight: 15,
      behavioralWeight: 10,
      rankingResumeWeight: 60,
      rankingTestWeight: 40,
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/jobs')
      .send(payload)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.title).toBe(payload.title);
    expect(response.body.status).toBe(JobStatus.OPEN);
    createdJobId = response.body.id;
  });

  it('POST /api/v1/jobs - deve rejeitar criação quando os pesos de avaliação não somarem 100', async () => {
    const payload = {
      title: 'Desenvolvedor Frontend',
      description: 'React/Next.js',
      requirements: 'TypeScript',
      experienceLevel: ExperienceLevel.MID,
      educationWeight: 50, // 50 + 20 + 20 + 20 + 15 + 10 = 135
    };

    await request(app.getHttpServer())
      .post('/api/v1/jobs')
      .send(payload)
      .expect(400);
  });

  it('GET /api/v1/jobs - deve listar vagas paginadas', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/jobs')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body.jobs)).toBe(true);
    expect(response.body.total).toBeGreaterThanOrEqual(1);
    expect(response.body.page).toBe(1);
  });

  it('GET /api/v1/jobs/:id - deve buscar os detalhes da vaga criada', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/jobs/${createdJobId}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(createdJobId);
    expect(response.body.title).toBe('Desenvolvedor Fullstack Sr');
  });

  it('GET /api/v1/jobs/:id - deve retornar 404 para ID inexistente', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/jobs/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('PATCH /api/v1/jobs/:id - deve atualizar os dados da vaga', async () => {
    const updatePayload = {
      title: 'Engenheiro de Software Lead',
    };

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/jobs/${createdJobId}`)
      .send(updatePayload)
      .expect(200);

    expect(response.body.title).toBe('Engenheiro de Software Lead');
  });

  it('PATCH /api/v1/jobs/:id/status - deve alterar o status da vaga', async () => {
    const statusPayload = {
      status: JobStatus.CLOSED,
    };

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/jobs/${createdJobId}/status`)
      .send(statusPayload)
      .expect(200);

    expect(response.body.status).toBe(JobStatus.CLOSED);
  });

  it('DELETE /api/v1/jobs/:id - deve remover (soft-delete) a vaga', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/jobs/${createdJobId}`)
      .expect(204);

    // Após o soft-delete, a busca por ID deve retornar 404
    await request(app.getHttpServer())
      .get(`/api/v1/jobs/${createdJobId}`)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
