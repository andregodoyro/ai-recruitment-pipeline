import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CandidateStatus, JobStatus, Recommendation, Evaluation, Candidate, Job, Resume } from '@prisma/client';
import {
  SCREENING_REPOSITORY,
  IScreeningRepository,
  CreateEvaluationInput,
} from '../src/modules/screening/domain/screening.repository.interface';
import {
  CANDIDATES_REPOSITORY,
  ICandidatesRepository,
} from '../src/modules/candidates/domain/candidates.repository.interface';
import {
  JOBS_REPOSITORY,
  IJobsRepository,
} from '../src/modules/jobs/domain/jobs.repository.interface';
import {
  RESUMES_REPOSITORY,
  IResumesRepository,
} from '../src/modules/resumes/domain/resumes.repository.interface';
import {
  AI_RECRUITMENT_EVALUATOR,
  IAIRecruitmentEvaluator,
} from '../src/ai/interfaces/ai-evaluator.interface';

const CANDIDATE_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const JOB_UUID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const RESUME_UUID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

class InMemoryScreeningRepository implements IScreeningRepository {
  private evaluations: Evaluation[] = [];

  async create(data: CreateEvaluationInput): Promise<Evaluation> {
    const evaluation: Evaluation = {
      id: `eval-${Date.now()}-${Math.random()}`,
      candidateId: data.candidateId,
      jobId: data.jobId,
      resumeId: data.resumeId,
      educationScore: data.educationScore,
      automationScore: data.automationScore,
      dataScore: data.dataScore,
      experienceScore: data.experienceScore,
      technologyScore: data.technologyScore,
      behavioralScore: data.behavioralScore,
      finalScore: data.finalScore,
      strengths: data.strengths,
      gaps: data.gaps,
      justification: data.justification,
      recommendation: data.recommendation,
      promptVersion: data.promptVersion,
      aiModel: data.aiModel,
      rawAiResponse: data.rawAiResponse,
      createdAt: new Date(),
    };
    this.evaluations.push(evaluation);
    return evaluation;
  }

  async findById(id: string): Promise<Evaluation | null> {
    return this.evaluations.find((e) => e.id === id) ?? null;
  }

  async findByJobId(jobId: string): Promise<Evaluation[]> {
    return this.evaluations
      .filter((e) => e.jobId === jobId)
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  async findByCandidateId(candidateId: string): Promise<Evaluation[]> {
    return this.evaluations.filter((e) => e.candidateId === candidateId);
  }
}

class MockCandidatesRepo implements Partial<ICandidatesRepository> {
  async findById(id: string): Promise<Candidate | null> {
    if (id === CANDIDATE_UUID) {
      return {
        id: CANDIDATE_UUID,
        name: 'Maria Souza',
        email: 'maria@email.com',
        phone: null,
        status: CandidateStatus.SCREENING,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    return {
      id,
      name: 'Maria Souza',
      email: 'maria@email.com',
      phone: null,
      status,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

class MockJobsRepo implements Partial<IJobsRepository> {
  async findById(id: string): Promise<Job | null> {
    if (id === JOB_UUID) {
      return {
        id: JOB_UUID,
        title: 'Engenheira de Software',
        description: 'Vaga Fullstack',
        requirements: 'Node.js, React',
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

class MockResumesRepo implements Partial<IResumesRepository> {
  async findById(id: string): Promise<Resume | null> {
    if (id === RESUME_UUID) {
      return {
        id: RESUME_UUID,
        candidateId: CANDIDATE_UUID,
        jobId: JOB_UUID,
        fileName: 'cv.pdf',
        fileUrl: '/uploads/cv.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 1024,
        extractedText: 'Experiência relevante em Node.js e React.',
        isActive: true,
        uploadedAt: new Date(),
      };
    }
    return null;
  }

  async findByCandidateAndJob(candidateId: string, jobId: string): Promise<Resume[]> {
    if (candidateId === CANDIDATE_UUID && jobId === JOB_UUID) {
      return [
        {
          id: RESUME_UUID,
          candidateId: CANDIDATE_UUID,
          jobId: JOB_UUID,
          fileName: 'cv.pdf',
          fileUrl: '/uploads/cv.pdf',
          mimeType: 'application/pdf',
          fileSizeBytes: 1024,
          extractedText: 'Experiência relevante em Node.js e React.',
          isActive: true,
          uploadedAt: new Date(),
        },
      ];
    }
    return [];
  }
}

class MockAiEvaluator implements IAIRecruitmentEvaluator {
  async evaluate(): Promise<any> {
    return {
      scores: { education: 8.5, automation: 9.0, data: 8.0, experience: 8.5, technology: 9.0, behavioral: 8.0 },
      finalScore: 8.55,
      strengths: ['Domínio em Node.js', 'Boa experiência prévia'],
      gaps: [],
      justification: 'Candidata com excelente fit técnico para a vaga.',
      recommendation: 'APPROVED',
      promptVersion: '1.0.0',
      aiModel: 'gpt-4o-mini',
      rawResponse: '{}',
    };
  }
}

describe('Screening Controller (e2e)', () => {
  let app: INestApplication<App>;
  let evaluationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SCREENING_REPOSITORY)
      .useValue(new InMemoryScreeningRepository())
      .overrideProvider(CANDIDATES_REPOSITORY)
      .useValue(new MockCandidatesRepo())
      .overrideProvider(JOBS_REPOSITORY)
      .useValue(new MockJobsRepo())
      .overrideProvider(RESUMES_REPOSITORY)
      .useValue(new MockResumesRepo())
      .overrideProvider(AI_RECRUITMENT_EVALUATOR)
      .useValue(new MockAiEvaluator())
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

  it('POST /api/v1/screening/evaluate - deve executar a triagem por IA com sucesso', async () => {
    const payload = {
      candidateId: CANDIDATE_UUID,
      jobId: JOB_UUID,
      resumeId: RESUME_UUID,
    };

    const res = await request(app.getHttpServer())
      .post('/api/v1/screening/evaluate')
      .send(payload)
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.finalScore).toBe(8.55);
    expect(res.body.recommendation).toBe(Recommendation.APPROVED);
    expect(res.body.promptVersion).toBe('1.0.0');
    evaluationId = res.body.id;
  });

  it('GET /api/v1/screening/evaluations/:id - deve obter detalhes da avaliação', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/screening/evaluations/${evaluationId}`)
      .expect(200);

    expect(res.body.id).toBe(evaluationId);
    expect(res.body.finalScore).toBe(8.55);
  });

  it('GET /api/v1/jobs/:jobId/evaluations - deve listar avaliações da vaga', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/jobs/${JOB_UUID}/evaluations`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(evaluationId);
  });

  it('GET /api/v1/candidates/:candidateId/evaluations - deve listar avaliações do candidato', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/candidates/${CANDIDATE_UUID}/evaluations`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(evaluationId);
  });

  it('POST /api/v1/screening/evaluate - deve retornar 404 para candidato inexistente', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/screening/evaluate')
      .send({ candidateId: '00000000-0000-0000-0000-000000000000', jobId: JOB_UUID })
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
