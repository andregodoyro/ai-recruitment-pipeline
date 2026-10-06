# Documentação da API REST

A API foi projetada seguindo as convenções REST, utilizando respostas padronizadas em formato JSON e prefixo `/api/v1`.

Documentação interativa OpenAPI/Swagger disponível em: `http://localhost:3001/api/docs`.

---

## 1. Módulo Jobs (`/api/v1/jobs`)

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `POST` | `/api/v1/jobs` | Criar nova vaga de emprego | `201 Created` |
| `GET` | `/api/v1/jobs` | Listar vagas com paginação e busca | `200 OK` |
| `GET` | `/api/v1/jobs/:id` | Detalhes de uma vaga específica | `200 OK` |
| `PATCH` | `/api/v1/jobs/:id` | Atualizar dados da vaga | `200 OK` |
| `PATCH` | `/api/v1/jobs/:id/status` | Alterar status (`OPEN`, `CLOSED`, `ARCHIVED`) | `200 OK` |
| `DELETE` | `/api/v1/jobs/:id` | Soft delete da vaga | `204 No Content` |

---

## 2. Módulo Candidates (`/api/v1/candidates`)

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `POST` | `/api/v1/candidates` | Cadastrar novo candidato | `201 Created` |
| `GET` | `/api/v1/candidates` | Listar candidatos com filtros e paginação | `200 OK` |
| `GET` | `/api/v1/candidates/:id` | Detalhes de um candidato | `200 OK` |
| `PATCH` | `/api/v1/candidates/:id` | Atualizar dados cadastrais do candidato | `200 OK` |
| `DELETE` | `/api/v1/candidates/:id` | Soft delete do candidato | `204 No Content` |

---

## 3. Módulo Resumes (`/api/v1/resumes`)

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `POST` | `/api/v1/candidates/:candidateId/resumes` | Upload de currículo (multipart/form-data) | `201 Created` |
| `GET` | `/api/v1/resumes/:id` | Obter detalhes e texto extraído do CV | `200 OK` |
| `GET` | `/api/v1/candidates/:candidateId/resumes` | Listar histórico de currículos do candidato | `200 OK` |

---

## 4. Módulo Screening (Triagem IA) (`/api/v1/screening`)

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `POST` | `/api/v1/screening/evaluate` | Executar triagem automatizada com IA | `201 Created` |
| `GET` | `/api/v1/screening/evaluations/:id` | Detalhes da avaliação gerada pela IA | `200 OK` |
| `GET` | `/api/v1/jobs/:jobId/evaluations` | Listar avaliações de triagem de uma vaga | `200 OK` |
| `GET` | `/api/v1/candidates/:candidateId/evaluations` | Listar avaliações de um candidato | `200 OK` |

---

## 5. Módulo Tests & Questions (`/api/v1/tests`)

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `POST` | `/api/v1/tests` | Criar teste técnico para uma vaga | `201 Created` |
| `GET` | `/api/v1/tests` | Listar testes com filtros e paginação | `200 OK` |
| `GET` | `/api/v1/jobs/:jobId/tests` | Listar testes vinculados a uma vaga | `200 OK` |
| `GET` | `/api/v1/tests/:id` | Detalhes de um teste técnico | `200 OK` |
| `PATCH` | `/api/v1/tests/:id` | Atualizar dados do teste | `200 OK` |
| `PATCH` | `/api/v1/tests/:id/status` | Publicar/Fechar teste (`DRAFT`, `PUBLISHED`, `CLOSED`) | `200 OK` |
| `DELETE` | `/api/v1/tests/:id` | Excluir teste e suas questões | `204 No Content` |
| `POST` | `/api/v1/tests/:testId/questions` | Adicionar questão ao teste | `201 Created` |
| `GET` | `/api/v1/tests/:testId/questions` | Listar questões de um teste | `200 OK` |
| `PATCH` | `/api/v1/questions/:id` | Atualizar enunciado, opções ou gabarito | `200 OK` |
| `DELETE` | `/api/v1/questions/:id` | Remover questão | `204 No Content` |

---

## 6. Módulo Candidate Tests (`/api/v1/candidate-tests`)

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `POST` | `/api/v1/tests/:testId/assign/:candidateId` | Atribuir teste publicado a candidato | `201 Created` |
| `GET` | `/api/v1/candidate-tests/:id` | Consultar respostas e resultado da prova | `200 OK` |
| `POST` | `/api/v1/candidate-tests/:id/submit` | Submeter respostas, auto-corrigir e pontuar | `201 Created` |
| `GET` | `/api/v1/candidates/:candidateId/tests` | Listar provas aplicadas ao candidato | `200 OK` |

---

## 7. Módulo Ranking (`/api/v1/jobs/:jobId/ranking`)

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `GET` | `/api/v1/jobs/:jobId/ranking` | Ranking consolidado dos candidatos da vaga | `200 OK` |
| `GET` | `/api/v1/jobs/:jobId/ranking/:candidateId` | Posição individual de um candidato no ranking | `200 OK` |

---

## 8. Módulo Interviews (`/api/v1/interviews`)

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `POST` | `/api/v1/interviews` | Agendar entrevista para candidato `TEST_APPROVED` | `201 Created` |
| `GET` | `/api/v1/interviews` | Listar entrevistas com filtros e paginação | `200 OK` |
| `GET` | `/api/v1/interviews/:id` | Detalhes de uma entrevista | `200 OK` |
| `GET` | `/api/v1/jobs/:jobId/interviews` | Listar entrevistas de uma vaga | `200 OK` |
| `GET` | `/api/v1/candidates/:candidateId/interviews` | Listar entrevistas de um candidato | `200 OK` |
| `PATCH` | `/api/v1/interviews/:id` | Atualizar dados ou status da entrevista | `200 OK` |
| `DELETE` | `/api/v1/interviews/:id` | Cancelar/excluir agendamento | `204 No Content` |

---

## 9. Módulo Dashboard (`/api/v1/dashboard`)

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `GET` | `/api/v1/dashboard/overview` | Visão analítica geral, funil, métricas e histograma | `200 OK` |

---

## 10. Health Check

| Método | Endpoint | Descrição | Status Sucesso |
|---|---|---|---|
| `GET` | `/health` | Verificação de disponibilidade da aplicação | `200 OK` |
