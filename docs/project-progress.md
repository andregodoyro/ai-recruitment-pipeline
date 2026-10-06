# Project Progress

## Status Geral

| Etapa | Nome | Status |
|---|---|---|
| **0** | Análise e Planejamento | ✅ CONCLUÍDA |
| **1** | Fundação | ✅ CONCLUÍDA |
| **2** | Jobs | ✅ CONCLUÍDA |
| **3** | Candidates & Resumes | ✅ CONCLUÍDA |
| **4** | AI Screening | ✅ CONCLUÍDA |
| **5** | Tests | ✅ CONCLUÍDA |
| **6** | Ranking | ✅ CONCLUÍDA |
| **7** | Interviews | ✅ CONCLUÍDA |
| **8** | Dashboard | ✅ CONCLUÍDA |
| **9** | Quality & Security | ⏳ PRÓXIMA ETAPA |
| **10** | Documentação e Release | ⏳ NÃO INICIADA |

---

## Etapa 0 — Análise e Planejamento
**Status:** ✅ CONCLUÍDA  
**Data:** 2026-10-06

### Entregas
- Resumo do produto e personas
- Requisitos funcionais (RF-01 a RF-08)
- Requisitos não funcionais
- Regras de negócio (RN-01 a RN-07)
- Casos de uso (UC-01 a UC-07)
- Modelagem de domínio (9 entidades)
- Arquitetura proposta (Clean Architecture + Monólito Modular)
- Stack definida (NestJS + Next.js 14 + Prisma + PostgreSQL)
- Estrutura de diretórios
- API endpoints refinados (30+)
- Roadmap de 10 etapas
- Riscos técnicos e decisões arquiteturais

---

## Etapa 1 — Fundação
**Status:** ✅ CONCLUÍDA  
**Data fim:** 2026-10-06  

### Checklist
- [x] Arquivos raiz (README, .gitignore, .env.example, docker-compose.yml)
- [x] Projeto NestJS scaffolded
- [x] Dependências do backend instaladas (Prisma 6.4.0, OpenAI, Vitest, NestJS Swagger)
- [x] Schema Prisma completo
- [x] Estrutura de módulos do backend
- [x] Health check endpoint (`/health`)
- [x] Projeto Next.js 16 scaffolded
- [x] GitHub Actions CI
- [x] Dockerfiles (backend e frontend)
- [x] Documentação inicial (docs/)

---

## Etapa 2 — Jobs
**Status:** ✅ CONCLUÍDA  
**Data fim:** 2026-10-06  

### Entregas
- [x] Interface de Repositório (`IJobsRepository`)
- [x] DTOs com validações `class-validator` e Swagger (`CreateJobDto`, `UpdateJobDto`, `UpdateJobStatusDto`, `ListJobsQueryDto`)
- [x] Validação de regra de negócio RN-01 (soma dos pesos de avaliação = 100%, soma dos pesos de ranking = 100%)
- [x] Use Cases (`CreateJobUseCase`, `GetJobUseCase`, `ListJobsUseCase`, `UpdateJobUseCase`, `UpdateJobStatusUseCase`, `DeleteJobUseCase`)
- [x] Repositório Prisma (`PrismaJobsRepository`) com suporte a paginação e soft delete
- [x] Controlador REST (`JobsController`) mapeado para `/api/v1/jobs`
- [x] Testes unitários dos Use Cases e Controller
- [x] Suíte de testes E2E para todos os 8 cenários da API de vagas (`jobs.e2e-spec.ts`)

---

## Etapa 3 — Candidates & Resumes
**Status:** ✅ CONCLUÍDA  
**Data fim:** 2026-10-06  

### Entregas
- [x] Interfaces de Repositório (`ICandidatesRepository`, `IResumesRepository`)
- [x] Serviço de extração de texto PDF/TXT (`PdfTextExtractorService` utilizando `pdf-parse`)
- [x] DTOs com validação `class-validator` e Swagger (`CreateCandidateDto`, `UpdateCandidateDto`, `ListCandidatesQueryDto`, `UploadResumeDto`)
- [x] Validação de unicidade de e-mail (RN-02)
- [x] Use Cases do Candidato (`CreateCandidateUseCase`, `GetCandidateUseCase`, `ListCandidatesUseCase`, `UpdateCandidateUseCase`, `DeleteCandidateUseCase`)
- [x] Use Cases do Currículo (`UploadResumeUseCase`, `GetResumeUseCase`, `ListCandidateResumesUseCase`)
- [x] Atualização automática do status do candidato para `SCREENING` ao enviar currículo e desativação de currículos anteriores da mesma vaga
- [x] Repositórios Prisma (`PrismaCandidatesRepository`, `PrismaResumesRepository`)
- [x] Controladores REST (`CandidatesController`, `ResumesController`)
- [x] Testes unitários para Use Cases e Controllers de Candidatos e Currículos
- [x] Suíte de testes E2E com 9 cenários da API (`candidates-resumes.e2e-spec.ts`)

---

## Etapa 4 — AI Screening
**Status:** ✅ CONCLUÍDA  
**Data fim:** 2026-10-06  

### Entregas
- [x] Contrato e Abstração de IA (`IAIRecruitmentEvaluator`, `AiEvaluationInput`, `AiEvaluationResult`)
- [x] Implementação do Serviço OpenAI (`OpenAiEvaluatorService`) com suporte a `OPENAI_MODEL` (`gpt-4o-mini`), JSON estrito, cálculo ponderado de notas e fallback gracioso/offline para desenvolvimento local
- [x] Prompt de Triagem Versionado (`resume-screening.v1.ts`, versão `1.0.0`) com regras éticas e de não-discriminação
- [x] Interface de Repositório (`IScreeningRepository`) e Repositório Prisma (`PrismaScreeningRepository`)
- [x] DTO (`EvaluateResumeDto`) com validações `class-validator` UUID e Swagger
- [x] Use Cases (`EvaluateResumeUseCase`, `GetEvaluationUseCase`, `ListJobEvaluationsUseCase`, `ListCandidateEvaluationsUseCase`)
- [x] Atualização automática do status do candidato para `SCREENING_APPROVED` caso a recomendação da IA seja `APPROVED`
- [x] Controlador REST (`ScreeningController`) mapeado para `/api/v1/screening` e endpoints de listagem por vaga e candidato
- [x] Testes unitários para Serviço OpenAI, Use Cases e Controller (`33` testes unitários totais no backend)
- [x] Suíte de testes E2E para API de triagem por IA (`screening.e2e-spec.ts`, `23` testes E2E totais no backend)

---

## Etapa 5 — Tests
**Status:** ✅ CONCLUÍDA  
**Data fim:** 2026-10-06  

### Entregas
- [x] Interfaces de Repositório (`ITestsRepository`, `IQuestionsRepository`, `ICandidateTestsRepository`)
- [x] DTOs com validações `class-validator` e Swagger (`CreateTestDto`, `UpdateTestDto`, `UpdateTestStatusDto`, `CreateQuestionDto`, `UpdateQuestionDto`, `SubmitAnswersDto`, `ListTestsQueryDto`)
- [x] Regras de negócio implementadas (RN-03: apenas testes com status `PUBLISHED` podem ser atribuídos; correção automática para `MULTIPLE_CHOICE` e `TRUE_FALSE`; cálculo ponderado de score; transição automática do candidato para `TEST_APPROVED` quando score ≥ 7.0)
- [x] Use Cases de Testes (`CreateTestUseCase`, `GetTestUseCase`, `ListTestsUseCase`, `UpdateTestUseCase`, `UpdateTestStatusUseCase`, `DeleteTestUseCase`)
- [x] Use Cases de Questões (`CreateQuestionUseCase`, `ListQuestionsUseCase`, `UpdateQuestionUseCase`, `DeleteQuestionUseCase`)
- [x] Use Cases de Aplicação e Correção (`AssignTestUseCase`, `SubmitAnswersUseCase`, `GetCandidateTestUseCase`)
- [x] Repositórios Prisma (`PrismaTestsRepository`, `PrismaQuestionsRepository`, `PrismaCandidateTestsRepository`)
- [x] Controladores REST (`TestsController`, `CandidateTestsController`) mapeando endpoints em `/api/v1/tests`, `/api/v1/questions`, `/api/v1/candidate-tests`
- [x] Testes unitários para Use Cases e Controllers (totalizando **55** testes unitários no backend)
- [x] Suíte de testes E2E para o ciclo completo de testes (`tests.e2e-spec.ts`, totalizando **29** testes E2E no backend)
- [x] Build do NestJS (`nest build`) validado com sucesso sem erros TypeScript

---

## Etapa 6 — Ranking
**Status:** ✅ CONCLUÍDA  
**Data fim:** 2026-10-06

### Auditoria Pré-Etapa 6
- `Evaluation.finalScore` (resumeScore) e `CandidateTest.score` (testScore) disponíveis e consistentes no schema ✅
- `Job.rankingResumeWeight` e `Job.rankingTestWeight` presentes, configuráveis por vaga e já validados na Etapa 2 para soma = 100 ✅
- `IScreeningRepository` e `ICandidateTestsRepository` exportam métodos de consulta por vaga ✅
- Nenhuma inconsistência ou pendência encontrada nas Etapas 1–5 ✅

### Entregas
- [x] Interface de Domínio (`IRankingRepository`, `RankingEntry`) em `ranking.repository.interface.ts`
- [x] `PrismaRankingRepository` — consultas read-only a `Evaluation` e `CandidateTest` (via relação `test.jobId`)
- [x] `GetJobRankingUseCase` — ranking completo da vaga com fórmula `finalScore = resumeScore × (rankingResumeWeight/100) + testScore × (rankingTestWeight/100)`. Candidatos sem teste têm apenas `resumeScore` considerado. Candidatos com mesmo score recebem a mesma posição (tie handling).
- [x] `GetCandidateRankingPositionUseCase` — posição individual de um candidato dentro do ranking de uma vaga
- [x] `RankingController` expondo `GET /api/v1/jobs/:jobId/ranking` e `GET /api/v1/jobs/:jobId/ranking/:candidateId`
- [x] `RankingModule` com wiring completo (imports JobsModule, CandidatesModule, DatabaseModule)
- [x] Testes unitários para `GetJobRankingUseCase` (4 casos: fórmula 60/40, empate, testScore nulo, dados de saída) e `RankingController` (2 casos)
- [x] Suíte E2E `ranking.e2e-spec.ts` (3 testes: ranking completo, posição individual, 404 para vaga inexistente)
- [x] Build do NestJS (`nest build`) validado com sucesso — 0 erros TypeScript
- [x] **61 testes unitários** (18 suítes) e **32 testes E2E** (6 suítes) — todos passando

---

## Etapa 7 — Interviews
**Status:** ✅ CONCLUÍDA  
**Data fim:** 2026-10-06

### Auditoria Pré-Etapa 7
- Modelo `Interview` e enum `InterviewStatus` (`SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`) já consolidados no schema Prisma ✅
- Enum `CandidateStatus.TEST_APPROVED` e `CandidateStatus.INTERVIEW` disponíveis ✅
- Regra de transição e trava de negócio verificada: apenas candidatos em `TEST_APPROVED` (ou já em `INTERVIEW`) podem receber agendamento de entrevistas em vagas abertas ✅

### Entregas
- [x] Contrato de repositório de domínio (`IInterviewsRepository`) e token `INTERVIEWS_REPOSITORY`
- [x] DTOs com validações `class-validator` e Swagger (`CreateInterviewDto`, `UpdateInterviewDto`, `ListInterviewsQueryDto`)
- [x] Regras de negócio implementadas nos Use Cases:
  - Vaga deve existir e estar com status `OPEN`
  - Candidato deve existir e possuir status `TEST_APPROVED` (ou `INTERVIEW`)
  - Atualização automática do status do candidato para `INTERVIEW` após criação
  - Validação de data/hora ISO-8601 e URLs de reunião válidas
- [x] Use Cases implementados:
  - `CreateInterviewUseCase`
  - `GetInterviewUseCase`
  - `ListInterviewsUseCase`
  - `UpdateInterviewUseCase`
  - `DeleteInterviewUseCase`
- [x] `PrismaInterviewsRepository` implementado com suporte a paginação e filtros
- [x] `InterviewsController` mapeando rotas REST:
  - `POST /api/v1/interviews`
  - `GET /api/v1/interviews`
  - `GET /api/v1/interviews/:id`
  - `GET /api/v1/jobs/:jobId/interviews`
  - `GET /api/v1/candidates/:candidateId/interviews`
  - `PATCH /api/v1/interviews/:id`
  - `DELETE /api/v1/interviews/:id`
- [x] Módulo `InterviewsModule` conectado e exportando use cases e repositório
- [x] Testes unitários para `CreateInterviewUseCase` e `InterviewsController` (totalizando **69** testes unitários no backend)
- [x] Suíte de testes E2E (`interviews.e2e-spec.ts`, totalizando **37** testes E2E no backend)
- [x] Build do NestJS (`nest build`) validado com sucesso sem erros TypeScript

---

## Etapa 8 — Dashboard
**Status:** ✅ CONCLUÍDA  
**Data fim:** 2026-10-06

### Auditoria Pré-Etapa 8
- Mapeamento das fontes de dados: `Job`, `Candidate`, `Resume`, `Evaluation`, `CandidateTest`, `Interview` existentes e integradas via relacionamentos Prisma ✅
- Métricas e agregações necessárias (contagens, distribuição de scores e agrupamentos por status) plenamente suportadas pelo modelo relacional ✅
- Parâmetros de filtro (`jobId`, `startDate`, `endDate`) definidos e validados ✅

### Entregas
- [x] Contrato de repositório de domínio (`IDashboardRepository`) e token `DASHBOARD_REPOSITORY`
- [x] Tipagem de dados para o Dashboard (`DashboardMetrics`, `CandidateFunnelStage`, `ScoreDistribution`, `TopCandidateEntry`, `DashboardOverview`)
- [x] DTO com validação Swagger (`DashboardFilterDto`)
- [x] Use Case `GetDashboardOverviewUseCase` com validação de existência de vaga caso o filtro seja informado
- [x] `PrismaDashboardRepository` agregando:
  - **Métricas Gerais:** Total de vagas, vagas abertas, total de candidatos, currículos, avaliações, testes técnicos, entrevistas e taxa de conversão para contratação
  - **Funil de Candidatos:** Distribuição de candidatos em cada etapa do fluxo seletivo (`NEW`, `SCREENING`, `SCREENING_APPROVED`, `TEST`, `TEST_APPROVED`, `INTERVIEW`, `HIRED`, `REJECTED`) e percentual do total
  - **Distribuição de Scores:** Histograma em faixas de pontuação (`0-2`, `2-4`, `4-6`, `6-8`, `8-10`) para currículos e testes
  - **Top Candidatos / Ranking:** Lista ordenada dos 10 melhores candidatos calculando o score final ponderado pelos pesos específicos da vaga
  - **Filtros Dinâmicos:** Suporte para filtros por vaga (`jobId`) e intervalo de datas (`startDate` e `endDate`)
- [x] Controller REST `DashboardController` expondo `GET /api/v1/dashboard/overview`
- [x] Módulo `DashboardModule` registrado e integrado
- [x] Testes unitários para `GetDashboardOverviewUseCase` e `DashboardController` (totalizando **73** testes unitários no backend)
- [x] Suíte de testes E2E (`dashboard.e2e-spec.ts`, totalizando **40** testes E2E no backend)
- [x] Build do NestJS (`nest build`) validado com sucesso sem erros TypeScript

---

## Etapa 9 — Quality & Security
**Status:** ⏳ NÃO INICIADA

---

## Etapa 10 — Documentação e Release
**Status:** ⏳ NÃO INICIADA
