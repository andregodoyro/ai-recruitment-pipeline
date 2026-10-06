# AI Recruitment Pipeline 🤖

Uma plataforma de recrutamento assistida por Inteligência Artificial que automatiza e estrutura o processo seletivo de ponta a ponta.

## Visão Geral

O sistema cobre quatro grandes domínios operacionais:

| Domínio | Descrição |
|---|---|
| **Triagem de CVs** | Extração, análise por IA e pontuação de currículos |
| **Testes** | Criação, aplicação e correção de testes técnicos |
| **Ranking** | Combinação de scores CV + Teste em ranking consolidado |
| **Entrevistas** | Agendamento e gestão do processo final |

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + NestJS + TypeScript |
| Frontend | Next.js 14 (App Router) + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| IA | OpenAI API (abstração própria) |
| Infra | Docker Compose |
| CI | GitHub Actions |

## Execução Local (Docker)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ai-recruitment-pipeline.git
cd ai-recruitment-pipeline

# Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves (especialmente OPENAI_API_KEY)

# Suba o ambiente completo
docker compose up
```

Serviços disponíveis:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Swagger Docs:** http://localhost:3001/api/docs
- **PostgreSQL:** localhost:5432

## Execução Local (Desenvolvimento)

### Pré-requisitos
- Node.js >= 20
- Docker (para o PostgreSQL)
- pnpm (recomendado)

```bash
# Suba apenas o banco de dados
docker compose up db -d

# Backend
cd backend
cp .env.example .env
pnpm install
pnpm run db:migrate
pnpm run dev

# Frontend (outro terminal)
cd frontend
pnpm install
pnpm run dev
```

## Estrutura do Projeto

```
ai-recruitment-pipeline/
├── backend/          # NestJS API (Clean Architecture)
├── frontend/         # Next.js 14 App
├── docs/             # Documentação técnica
├── .github/          # GitHub Actions CI
├── docker-compose.yml
└── .env.example
```

## Documentação

- [Arquitetura](docs/architecture.md)
- [Domínio](docs/domain.md)
- [API Endpoints](docs/api.md)
- [Avaliação por IA](docs/ai-evaluation.md)
- [Decisões Arquiteturais](docs/decisions.md)
- [Progresso do Projeto](docs/project-progress.md)

## Roadmap

Veja o [progresso detalhado](docs/project-progress.md) com todas as etapas de desenvolvimento.

## Licença

MIT
