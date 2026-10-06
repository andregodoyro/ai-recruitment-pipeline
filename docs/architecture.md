# Arquitetura — AI Recruitment Pipeline

## Visão Geral

O sistema utiliza **Monólito Modular** com **Clean Architecture** em camadas.

```
┌─────────────────────────────────────────────┐
│                   FRONTEND                   │
│            Next.js 14 (App Router)           │
└──────────────────────┬──────────────────────┘
                       │ HTTP REST /api
┌──────────────────────▼──────────────────────┐
│              PRESENTATION LAYER              │
│          NestJS Controllers                  │
│          Input Validation (class-validator)  │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│               APPLICATION LAYER              │
│    Use Cases / Application Services          │
│    DTOs                                      │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│                 DOMAIN LAYER                 │
│    Entities, Value Objects                   │
│    Repository Interfaces                     │
│    IAIRecruitmentEvaluator (interface)       │
│    IInterviewScheduler (interface)           │
└────────────┬────────────────────┬───────────┘
             │                    │
┌────────────▼──────┐  ┌──────────▼───────────┐
│  INFRASTRUCTURE   │  │   AI INTEGRATION      │
│  Prisma ORM       │  │   OpenAIEvaluator     │
│  PostgreSQL       │  │   (implements         │
│  File Storage     │  │    IAIEvaluator)      │
└───────────────────┘  └──────────────────────┘
```

## Módulos de Negócio

| Módulo | Responsabilidade | Etapa |
|---|---|---|
| `jobs` | CRUD de vagas, critérios | 2 |
| `candidates` | CRUD de candidatos, pipeline | 3 |
| `resumes` | Upload, extração de texto | 3 |
| `screening` | Triagem por IA, avaliação | 4 |
| `tests` | Testes, questões, correção | 5 |
| `ranking` | Cálculo e exibição de ranking | 6 |
| `interviews` | Agendamento, status | 7 |
| `dashboard` | Métricas, funil | 8 |

## Estrutura de cada módulo

```
modules/[nome]/
├── domain/
│   ├── entities/
│   ├── repositories/     ← interfaces
│   └── value-objects/
├── application/
│   ├── use-cases/
│   └── dtos/
├── infrastructure/
│   └── repositories/     ← implementações Prisma
├── presentation/
│   └── [nome].controller.ts
└── [nome].module.ts
```

## Princípios Aplicados

- **Clean Architecture**: Dependências sempre apontam para dentro (domínio não conhece infra)
- **Dependency Inversion**: Módulos dependem de interfaces, não implementações
- **Single Responsibility**: Cada classe tem uma única razão para mudar
- **Repository Pattern**: Acesso a dados abstraído por interfaces no domínio
- **DTO Pattern**: Dados de entrada/saída validados e tipados separadamente das entidades
