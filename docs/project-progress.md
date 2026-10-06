# Project Progress

## Status Geral

| Etapa | Nome | Status |
|---|---|---|
| **0** | Análise e Planejamento | ✅ CONCLUÍDA |
| **1** | Fundação | ✅ CONCLUÍDA |
| **2** | Jobs | ✅ CONCLUÍDA |
| **3** | Candidates & Resumes | ✅ CONCLUÍDA |
| **4** | AI Screening | ✅ CONCLUÍDA |
| **5** | Tests | ⏳ PRÓXIMA ETAPA |
| **6** | Ranking | ⏳ NÃO INICIADA |
| **7** | Interviews | ⏳ NÃO INICIADA |
| **8** | Dashboard | ⏳ NÃO INICIADA |
| **9** | Quality & Security | ⏳ NÃO INICIADA |
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
**Status:** ⏳ NÃO INICIADA

---

## Etapa 6 — Ranking
**Status:** ⏳ NÃO INICIADA

---

## Etapa 7 — Interviews
**Status:** ⏳ NÃO INICIADA

---

## Etapa 8 — Dashboard
**Status:** ⏳ NÃO INICIADA

---

## Etapa 9 — Quality & Security
**Status:** ⏳ NÃO INICIADA

---

## Etapa 10 — Documentação e Release
**Status:** ⏳ NÃO INICIADA
