import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  TestStatus,
  QuestionType,
  CandidateTestStatus,
  CandidateStatus,
  ExperienceLevel,
  JobStatus,
  Test as PrismaTest,
  Question as PrismaQuestion,
  CandidateTest as PrismaCandidateTest,
  Job,
  Candidate,
} from '@prisma/client';
import {
  TESTS_REPOSITORY,
  ITestsRepository,
  CreateTestInput,
  UpdateTestInput,
  ListTestsQuery,
  PaginatedTestsResult,
} from '../src/modules/tests/domain/tests.repository.interface';
import {
  QUESTIONS_REPOSITORY,
  IQuestionsRepository,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '../src/modules/tests/domain/questions.repository.interface';
import {
  CANDIDATE_TESTS_REPOSITORY,
  ICandidateTestsRepository,
  CandidateTestWithAnswers,
  SubmitAnswerInput,
} from '../src/modules/tests/domain/candidate-tests.repository.interface';
import {
  JOBS_REPOSITORY,
  IJobsRepository,
} from '../src/modules/jobs/domain/jobs.repository.interface';
import {
  CANDIDATES_REPOSITORY,
  ICandidatesRepository,
} from '../src/modules/candidates/domain/candidates.repository.interface';

const JOB_ID = '11111111-1111-4111-a111-111111111111';
const CANDIDATE_ID = '22222222-2222-4222-a222-222222222222';

class InMemoryTestsRepo implements ITestsRepository {
  private tests: PrismaTest[] = [];

  async create(data: CreateTestInput): Promise<PrismaTest> {
    const test: PrismaTest = {
      id: `test-${Date.now()}-${Math.random()}`,
      jobId: data.jobId,
      title: data.title,
      description: data.description ?? null,
      status: TestStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tests.push(test);
    return test;
  }

  async findById(id: string): Promise<PrismaTest | null> {
    return this.tests.find((t) => t.id === id) ?? null;
  }

  async findAll(query: ListTestsQuery): Promise<PaginatedTestsResult> {
    let filtered = [...this.tests];
    if (query.jobId) filtered = filtered.filter((t) => t.jobId === query.jobId);
    if (query.status) filtered = filtered.filter((t) => t.status === query.status);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return {
      tests: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  }

  async update(id: string, data: UpdateTestInput): Promise<PrismaTest> {
    const idx = this.tests.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Not found');
    this.tests[idx] = { ...this.tests[idx], ...data, updatedAt: new Date() };
    return this.tests[idx];
  }

  async updateStatus(id: string, status: TestStatus): Promise<PrismaTest> {
    return this.update(id, { ...this.tests.find((t) => t.id === id), status } as any);
  }

  async delete(id: string): Promise<void> {
    this.tests = this.tests.filter((t) => t.id !== id);
  }
}

class InMemoryQuestionsRepo implements IQuestionsRepository {
  private questions: PrismaQuestion[] = [];

  async create(data: CreateQuestionInput): Promise<PrismaQuestion> {
    const q: PrismaQuestion = {
      id: crypto.randomUUID(),
      testId: data.testId,
      questionText: data.questionText,
      type: data.type,
      options: data.options ?? [],
      correctAnswer: data.correctAnswer ?? null,
      weight: data.weight ?? 1,
      order: data.order ?? 0,
    };
    this.questions.push(q);
    return q;
  }

  async findById(id: string): Promise<PrismaQuestion | null> {
    return this.questions.find((q) => q.id === id) ?? null;
  }

  async findByTestId(testId: string): Promise<PrismaQuestion[]> {
    return this.questions.filter((q) => q.testId === testId);
  }

  async update(id: string, data: UpdateQuestionInput): Promise<PrismaQuestion> {
    const idx = this.questions.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error('Not found');
    this.questions[idx] = { ...this.questions[idx], ...data } as any;
    return this.questions[idx];
  }

  async delete(id: string): Promise<void> {
    this.questions = this.questions.filter((q) => q.id !== id);
  }
}

class InMemoryCandidateTestsRepo implements ICandidateTestsRepository {
  private records: CandidateTestWithAnswers[] = [];

  async assign(candidateId: string, testId: string): Promise<PrismaCandidateTest> {
    const ct: CandidateTestWithAnswers = {
      id: `ct-${Date.now()}-${Math.random()}`,
      candidateId,
      testId,
      score: null,
      status: CandidateTestStatus.PENDING,
      submittedAt: null,
      gradedAt: null,
      createdAt: new Date(),
      answers: [],
    };
    this.records.push(ct);
    return ct;
  }

  async findById(id: string): Promise<CandidateTestWithAnswers | null> {
    return this.records.find((r) => r.id === id) ?? null;
  }

  async findByCandidateId(candidateId: string): Promise<PrismaCandidateTest[]> {
    return this.records.filter((r) => r.candidateId === candidateId);
  }

  async findByTestId(testId: string): Promise<PrismaCandidateTest[]> {
    return this.records.filter((r) => r.testId === testId);
  }

  async findByCandidateAndTest(candidateId: string, testId: string): Promise<PrismaCandidateTest | null> {
    return this.records.find((r) => r.candidateId === candidateId && r.testId === testId) ?? null;
  }

  async updateStatus(id: string, status: CandidateTestStatus, score?: number): Promise<PrismaCandidateTest> {
    const item = this.records.find((r) => r.id === id);
    if (!item) throw new Error('Not found');
    item.status = status;
    if (score !== undefined) {
      item.score = score;
      item.gradedAt = new Date();
    }
    return item;
  }

  async submitAnswers(
    candidateTestId: string,
    answers: SubmitAnswerInput[],
  ): Promise<CandidateTestWithAnswers> {
    const item = this.records.find((r) => r.id === candidateTestId);
    if (!item) throw new Error('Not found');
    item.answers = answers.map((a, i) => ({
      id: `ca-${i}`,
      candidateTestId,
      questionId: a.questionId,
      answerText: a.answerText ?? null,
      isCorrect: null,
    }));
    return item;
  }
}

class MockJobsRepo implements Partial<IJobsRepository> {
  async findById(id: string): Promise<Job | null> {
    if (id === JOB_ID) {
      return {
        id: JOB_ID,
        title: 'Backend Engineer',
        description: 'Vaga NestJS',
        requirements: 'Node.js, TypeScript',
        desiredSkills: ['Vitest'],
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
    return null;
  }
}

class MockCandidatesRepo implements Partial<ICandidatesRepository> {
  async findById(id: string): Promise<Candidate | null> {
    if (id === CANDIDATE_ID) {
      return {
        id: CANDIDATE_ID,
        name: 'Carlos Oliveira',
        email: 'carlos@test.com',
        phone: null,
        status: CandidateStatus.SCREENING_APPROVED,
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
      name: 'Carlos Oliveira',
      email: 'carlos@test.com',
      phone: null,
      status,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

describe('Tests Module (e2e)', () => {
  let app: INestApplication<App>;
  let createdTestId: string;
  let createdQuestionId: string;
  let candidateTestId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TESTS_REPOSITORY)
      .useValue(new InMemoryTestsRepo())
      .overrideProvider(QUESTIONS_REPOSITORY)
      .useValue(new InMemoryQuestionsRepo())
      .overrideProvider(CANDIDATE_TESTS_REPOSITORY)
      .useValue(new InMemoryCandidateTestsRepo())
      .overrideProvider(JOBS_REPOSITORY)
      .useValue(new MockJobsRepo())
      .overrideProvider(CANDIDATES_REPOSITORY)
      .useValue(new MockCandidatesRepo())
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

  it('POST /api/v1/tests - deve criar um teste técnico', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/tests')
      .send({
        jobId: JOB_ID,
        title: 'Avaliação Prática Backend',
        description: 'Perguntas sobre arquitetura e Clean Code',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Avaliação Prática Backend');
    expect(res.body.status).toBe(TestStatus.DRAFT);
    createdTestId = res.body.id;
  });

  it('POST /api/v1/tests/:testId/questions - deve adicionar uma questão objetiva', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/tests/${createdTestId}/questions`)
      .send({
        questionText: 'Qual padrão é usado para inverter dependências no NestJS?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['Dependency Injection', 'Singleton', 'Observer'],
        correctAnswer: 'Dependency Injection',
        weight: 2,
        order: 1,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.correctAnswer).toBe('Dependency Injection');
    createdQuestionId = res.body.id;
  });

  it('PATCH /api/v1/tests/:id/status - deve publicar o teste (DRAFT -> PUBLISHED)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/tests/${createdTestId}/status`)
      .send({ status: TestStatus.PUBLISHED })
      .expect(200);

    expect(res.body.status).toBe(TestStatus.PUBLISHED);
  });

  it('POST /api/v1/tests/:testId/assign/:candidateId - deve atribuir o teste ao candidato', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/tests/${createdTestId}/assign/${CANDIDATE_ID}`)
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.candidateId).toBe(CANDIDATE_ID);
    expect(res.body.status).toBe(CandidateTestStatus.PENDING);
    candidateTestId = res.body.id;
  });

  it('POST /api/v1/candidate-tests/:id/submit - deve submeter respostas e calcular score com sucesso', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/candidate-tests/${candidateTestId}/submit`)
      .send({
        answers: [
          {
            questionId: createdQuestionId,
            answerText: 'Dependency Injection',
          },
        ],
      })
      .expect(201);

    expect(res.body.score).toBe(10);
    expect(res.body.status).toBe(CandidateTestStatus.GRADED);
  });

  it('GET /api/v1/candidate-tests/:id - deve consultar os detalhes da aplicação', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/candidate-tests/${candidateTestId}`)
      .expect(200);

    expect(res.body.id).toBe(candidateTestId);
    expect(res.body.answers.length).toBe(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
