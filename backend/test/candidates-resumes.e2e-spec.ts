import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CandidateStatus, JobStatus, Candidate, Resume, Job } from '@prisma/client';
import {
  CANDIDATES_REPOSITORY,
  ICandidatesRepository,
  CreateCandidateInput,
  UpdateCandidateInput,
  ListCandidatesQuery,
  PaginatedCandidatesResult,
} from '../src/modules/candidates/domain/candidates.repository.interface';
import {
  RESUMES_REPOSITORY,
  IResumesRepository,
  CreateResumeInput,
} from '../src/modules/resumes/domain/resumes.repository.interface';
import {
  JOBS_REPOSITORY,
  IJobsRepository,
} from '../src/modules/jobs/domain/jobs.repository.interface';
import {
  TEXT_EXTRACTOR,
  ITextExtractor,
} from '../src/modules/resumes/domain/services/text-extractor.interface';

class InMemoryCandidatesRepository implements ICandidatesRepository {
  private candidates: Candidate[] = [];

  async create(data: CreateCandidateInput): Promise<Candidate> {
    const candidate: Candidate = {
      id: `candidate-${Date.now()}-${Math.random()}`,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      status: CandidateStatus.NEW,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.candidates.push(candidate);
    return candidate;
  }

  async findById(id: string): Promise<Candidate | null> {
    const candidate = this.candidates.find((c) => c.id === id && !c.deletedAt);
    return candidate ?? null;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const candidate = this.candidates.find((c) => c.email === email && !c.deletedAt);
    return candidate ?? null;
  }

  async findAll(query: ListCandidatesQuery): Promise<PaginatedCandidatesResult> {
    let active = this.candidates.filter((c) => !c.deletedAt);
    if (query.status) {
      active = active.filter((c) => c.status === query.status);
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const total = active.length;
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      candidates: active.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: string, data: UpdateCandidateInput): Promise<Candidate> {
    const index = this.candidates.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Not found');
    this.candidates[index] = {
      ...this.candidates[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.candidates[index];
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    return this.update(id, { status });
  }

  async softDelete(id: string): Promise<void> {
    const index = this.candidates.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.candidates[index].deletedAt = new Date();
    }
  }
}

class InMemoryResumesRepository implements IResumesRepository {
  private resumes: Resume[] = [];

  async create(data: CreateResumeInput): Promise<Resume> {
    const resume: Resume = {
      id: `resume-${Date.now()}-${Math.random()}`,
      candidateId: data.candidateId,
      jobId: data.jobId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      mimeType: data.mimeType,
      fileSizeBytes: data.fileSizeBytes,
      extractedText: data.extractedText ?? null,
      isActive: data.isActive ?? true,
      uploadedAt: new Date(),
    };
    this.resumes.push(resume);
    return resume;
  }

  async findById(id: string): Promise<Resume | null> {
    return this.resumes.find((r) => r.id === id) ?? null;
  }

  async findByCandidateId(candidateId: string): Promise<Resume[]> {
    return this.resumes.filter((r) => r.candidateId === candidateId);
  }

  async findByCandidateAndJob(candidateId: string, jobId: string): Promise<Resume[]> {
    return this.resumes.filter((r) => r.candidateId === candidateId && r.jobId === jobId);
  }

  async deactivatePreviousResumes(candidateId: string, jobId: string): Promise<void> {
    this.resumes.forEach((r) => {
      if (r.candidateId === candidateId && r.jobId === jobId) {
        r.isActive = false;
      }
    });
  }
}

class MockTextExtractor implements ITextExtractor {
  async extractText(buffer: Buffer): Promise<string> {
    return 'Texto simulado do CV extraído com sucesso.';
  }
}

class MockJobsRepository implements Partial<IJobsRepository> {
  async findById(id: string): Promise<Job | null> {
    if (id === 'job-valid-1') {
      return {
        id: 'job-valid-1',
        title: 'Engenheiro de Software',
        description: 'Vaga para backend',
        requirements: 'Node.js, TypeScript',
        desiredSkills: ['Docker'],
        experienceLevel: 'SENIOR',
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

describe('Candidates & Resumes Controller (e2e)', () => {
  let app: INestApplication<App>;
  let candidateId: string;
  let resumeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CANDIDATES_REPOSITORY)
      .useValue(new InMemoryCandidatesRepository())
      .overrideProvider(RESUMES_REPOSITORY)
      .useValue(new InMemoryResumesRepository())
      .overrideProvider(JOBS_REPOSITORY)
      .useValue(new MockJobsRepository())
      .overrideProvider(TEXT_EXTRACTOR)
      .useValue(new MockTextExtractor())
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

  it('POST /api/v1/candidates - deve cadastrar um candidato', async () => {
    const payload = {
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '+55 11 98888-7777',
    };

    const res = await request(app.getHttpServer())
      .post('/api/v1/candidates')
      .send(payload)
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe(payload.name);
    expect(res.body.status).toBe(CandidateStatus.NEW);
    candidateId = res.body.id;
  });

  it('POST /api/v1/candidates - deve retornar 409 para e-mail duplicado', async () => {
    const payload = {
      name: 'Carlos Duplicado',
      email: 'carlos.oliveira@email.com',
    };

    await request(app.getHttpServer())
      .post('/api/v1/candidates')
      .send(payload)
      .expect(409);
  });

  it('GET /api/v1/candidates - deve listar candidatos', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/candidates')
      .expect(200);

    expect(res.body.candidates).toBeDefined();
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/candidates/:id - deve retornar detalhes do candidato', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/candidates/${candidateId}`)
      .expect(200);

    expect(res.body.id).toBe(candidateId);
  });

  it('PATCH /api/v1/candidates/:id - deve atualizar o candidato', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/candidates/${candidateId}`)
      .send({ name: 'Carlos Oliveira Editado' })
      .expect(200);

    expect(res.body.name).toBe('Carlos Oliveira Editado');
  });

  it('POST /api/v1/candidates/:candidateId/resumes - deve fazer upload do CV e atualizar status para SCREENING', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/candidates/${candidateId}/resumes`)
      .field('jobId', 'job-valid-1')
      .attach('file', Buffer.from('PDF Content'), 'curriculo_carlos.pdf')
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.candidateId).toBe(candidateId);
    expect(res.body.extractedText).toBe('Texto simulado do CV extraído com sucesso.');
    resumeId = res.body.id;

    // Verifica se o status do candidato virou SCREENING
    const candRes = await request(app.getHttpServer())
      .get(`/api/v1/candidates/${candidateId}`)
      .expect(200);
    expect(candRes.body.status).toBe(CandidateStatus.SCREENING);
  });

  it('GET /api/v1/resumes/:id - deve retornar o currículo por ID com texto extraído', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/resumes/${resumeId}`)
      .expect(200);

    expect(res.body.id).toBe(resumeId);
    expect(res.body.extractedText).toBe('Texto simulado do CV extraído com sucesso.');
  });

  it('GET /api/v1/candidates/:candidateId/resumes - deve listar os currículos do candidato', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/candidates/${candidateId}/resumes`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(resumeId);
  });

  it('DELETE /api/v1/candidates/:id - deve remover o candidato', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/candidates/${candidateId}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/v1/candidates/${candidateId}`)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
