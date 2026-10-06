# Decisões Arquiteturais (ADRs)

Este documento registra as principais decisões de design e engenharia tomadas ao longo do projeto.

---

## ADR 01 — Monólito Modular com Clean Architecture

- **Contexto:** A plataforma possui diferentes domínios interconectados (vagas, candidatos, triagem, testes, entrevistas e dashboard).
- **Decisão:** Adotar Monólito Modular organizado por Clean Architecture. Cada módulo possui suas camadas isoladas (`domain`, `application`, `infrastructure`, `presentation`), comunicando-se através de contratos de repositório e injeção de dependências do NestJS.
- **Consequências:** Alto desacoplamento, facilidade de manutenção e testes, sem a sobrecarga operacional de microserviços.

---

## ADR 02 — Inversão de Dependência em Repositórios e Serviços de IA

- **Contexto:** O backend precisa de alta testabilidade e independência de ferramentas externas (bancos de dados e APIs pagas).
- **Decisão:** A camada de domínio define interfaces abstratas (ex: `IJobsRepository`, `IAIRecruitmentEvaluator`), e o NestJS injeta as implementações via tokens `Symbol` ou `String`.
- **Consequências:** Testes E2E utilizam repositórios in-memory super rápidos sem depender de um banco PostgreSQL em execução. O serviço de IA opera com fallback determinístico sem chave de API da OpenAI.

---

## ADR 03 — Cálculo Dinâmico do Ranking On-Demand

- **Contexto:** Os scores finais dependem de pesos configuráveis por vaga que podem ser reajustados.
- **Decisão:** O ranking não é uma tabela estática persistida no banco; ele é calculado dinamicamente com base nas tabelas `evaluations` e `candidate_tests`.
- **Consequências:** Garante consistência imediata dos dados e evita complexidade de sincronização e caching prematuro.

---

## ADR 04 — Validação Estrita de Arquivos e Prevenção de Injeções

- **Contexto:** Currículos enviados por usuários são fontes externas não confiáveis.
- **Decisão:** Validação rigorosa de extensões e tipos MIME (`.pdf`, `.txt`), limitação de tamanho a 5 MB, truncamento de textos a 20.000 caracteres e diretivas no prompt contra Prompt Injection.
- **Consequências:** Proteção contra execução remota de código, abuso de tokens da OpenAI e ataques de manipulação de decisão por IA.

---

## ADR 05 — Exception Filter Global Centralizado

- **Contexto:** Stack traces e mensagens internas de banco de dados podem expor credenciais ou detalhes de infraestrutura se não forem tratadas.
- **Decisão:** Implementação de `AllExceptionsFilter` em `src/shared/filters/all-exceptions.filter.ts`.
- **Consequências:** Padronização das respostas de erro da API e proteção ativa contra vazamento de informações sensíveis.
