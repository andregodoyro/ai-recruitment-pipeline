# Project Progress

## Status Geral

| Etapa | Nome | Status |
|---|---|---|
| **0** | Análise e Planejamento | ✅ CONCLUÍDA |
| **1** | Fundação | ✅ CONCLUÍDA |
| **2** | Jobs | ✅ CONCLUÍDA |
| **3** | Candidates & Resumes | ⏳ PRÓXIMA ETAPA |
| **4** | AI Screening | ⏳ NÃO INICIADA |
| **5** | Tests | ⏳ NÃO INICIADA |
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
**Status:** ⏳ NÃO INICIADA

---

## Etapa 4 — AI Screening
**Status:** ⏳ NÃO INICIADA

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
