# AI Recruitment Pipeline 🤖

Uma plataforma de recrutamento e seleção inteligente e assistida por Inteligência Artificial que automatiza e estrutura o processo seletivo de ponta a ponta, desde a publicação da vaga até a entrevista final.

---

## 📌 Visão Geral

O sistema é construído sobre os princípios de **Clean Architecture** e **Monólito Modular**, cobrindo todas as etapas de um processo seletivo moderno:

| Domínio | Descrição |
|---|---|
| **Vagas (Jobs)** | Cadastro e gestão de vagas com critérios ponderados de avaliação e ranking |
| **Candidatos & CVs** | Recepção de candidaturas, upload seguro de arquivos e extração de texto (PDF/TXT) |
| **Triagem por IA** | Avaliação automatizada de compatibilidade via LLM com justificativa e notas detalhadas |
| **Testes Técnicos** | Elaboração de provas, questões com gabarito e correção automática |
| **Ranking** | Consolidação ponderada de notas (Currículo + Teste) com classificação dos candidatos |
| **Entrevistas** | Agendamento estruturado com trava de pré-requisito técnico (`TEST_APPROVED`) |
| **Dashboard** | Visão executiva com funil de conversão, histograma de scores e métricas gerais |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Backend** | Node.js (>= 20, recomendado 22 LTS), NestJS 12, TypeScript |
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, TypeScript |
| **Banco de Dados** | PostgreSQL 16 |
| **ORM** | Prisma 6.4.0 |
| **Inteligência Artificial** | OpenAI API (`gpt-4o-mini`) com abstração própria e fallback determinístico offline |
| **Testes** | Vitest (Unitários e E2E) + Supertest |
| **Infraestrutura & CI** | Docker, Docker Compose, GitHub Actions |

---

## 🚀 Execução Rápida com Docker

O projeto possui configuração completa pronta para execução com Docker Compose:

```bash
# 1. Clone o repositório
git clone https://github.com/andregodoyro/ai-recruitment-pipeline.git
cd ai-recruitment-pipeline

# 2. Configure as variáveis de ambiente
cp backend/.env.example backend/.env

# 3. Inicie todos os serviços (Banco, API e Frontend)
docker compose up -d --build
```

### Serviços Disponíveis:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Documentação OpenAPI (Swagger):** http://localhost:3001/api/docs
- **Health Check:** http://localhost:3001/health
- **PostgreSQL:** `localhost:5432`

---

## 💻 Desenvolvimento Local

### Pré-requisitos
- **Node.js:** Versão 20 ou 22 LTS instalada
- **Docker:** Para execução do banco de dados PostgreSQL
- **Gerenciador de Pacotes:** `npm` ou `pnpm`

### 1. Iniciar o Banco de Dados

```bash
docker compose up db -d
```

### 2. Configurar e Rodar o Backend

```bash
cd backend
cp .env.example .env

# Instalar dependências
npm install

# Gerar o client do Prisma e executar migrações
npx prisma generate
npx prisma migrate deploy

# Executar em modo de desenvolvimento
npm run start:dev
```

### 3. Rodar os Testes

O projeto conta com ampla cobertura de testes unitários e testes end-to-end:

```bash
cd backend

# Executar todos os testes unitários (76 testes)
npm run test

# Executar testes End-to-End (40 testes em 8 suítes)
npm run test:e2e

# Executar build de produção
npm run build
```

---

## 🔐 Variáveis de Ambiente

Arquivo de referência: `backend/.env.example`

| Variável | Descrição | Padrão Local |
|---|---|---|
| `NODE_ENV` | Ambiente de execução (`development`, `production`, `test`) | `development` |
| `BACKEND_PORT` | Porta HTTP da API | `3001` |
| `DATABASE_URL` | String de conexão com o PostgreSQL | `postgresql://recrut:recrut_password@localhost:5432/recruitment_db?schema=public` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `dev_secret_change_in_production` |
| `OPENAI_API_KEY` | Chave da API OpenAI (opcional — usa fallback determinístico se omitida) | `sk-your-key-here` |
| `OPENAI_MODEL` | Modelo de LLM a ser utilizado | `gpt-4o-mini` |
| `OPENAI_MAX_TOKENS` | Limite de tokens na resposta da IA | `2000` |
| `OPENAI_TIMEOUT_MS` | Timeout de chamadas à IA em milissegundos | `30000` |
| `UPLOAD_DIR` | Diretório de armazenamento temporário de uploads | `./uploads` |
| `MAX_FILE_SIZE_MB` | Limite máximo para upload de currículos em MB | `5` |
| `LOG_LEVEL` | Nível de detalhe dos logs (`debug`, `info`, `warn`, `error`) | `debug` |

---

## 📚 Documentação Técnica

- [Arquitetura do Sistema](docs/architecture.md) — Camadas, modularização e princípios
- [Domínio e Regras de Negócio](docs/domain.md) — Entidades, status e regras RN-01 a RN-07
- [Documentação da API REST](docs/api.md) — Todos os endpoints, métodos e retornos
- [Avaliação por IA](docs/ai-evaluation.md) — Abstração, fallback, prompts e proteções
- [Decisões de Design (ADRs)](docs/decisions.md) — Registro de decisões arquiteturais
- [Progresso do Projeto](docs/project-progress.md) — Histórico detalhado das etapas 0 a 10

---

## 🤝 Diretrizes de Contribuição

1. Crie uma branch para a sua feature (`git checkout -b feature/minha-feature`).
2. Siga as convenções de Clean Architecture e mantenha a separação em camadas (`domain`, `application`, `infrastructure`, `presentation`).
3. Adicione testes unitários para novos use cases e mantenha os testes E2E passando (`npm run test && npm run test:e2e`).
4. Garanta que o build compile sem erros (`npm run build`).
5. Abra um Pull Request com descrição detalhada das mudanças.

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
