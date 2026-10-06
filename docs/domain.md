# Documentação de Domínio e Regras de Negócio

## 1. Visão Geral do Domínio

O **AI Recruitment Pipeline** modela um fluxo ponta a ponta de recrutamento e seleção, gerenciando o ciclo de vida completo de vagas e candidatos através de fases bem delimitadas.

---

## 2. Entidades Principais

| Entidade | Descrição | Tabela |
|---|---|---|
| **Job** | Vaga de emprego com requisitos, competências desejadas e pesos de avaliação/ranking | `jobs` |
| **Candidate** | Perfil do profissional participante do processo seletivo | `candidates` |
| **Resume** | Arquivo de currículo anexado (PDF/TXT), texto extraído e histórico de uploads | `resumes` |
| **Evaluation** | Resultado da triagem automatizada gerada pelo modelo de Inteligência Artificial | `evaluations` |
| **Test** | Avaliação técnica elaborada para uma vaga específica | `tests` |
| **Question** | Questão objetiva (múltipla escolha, V/F) ou dissertativa vinculada a um teste | `questions` |
| **CandidateTest** | Aplicação de um teste a um candidato, contendo nota consolidada e status | `candidate_tests` |
| **CandidateAnswer** | Resposta registrada de um candidato para uma questão específica | `candidate_answers` |
| **Interview** | Entrevista agendada entre a equipe recrutadora e o candidato aprovado | `interviews` |

---

## 3. Ciclo de Vida do Candidato (`CandidateStatus`)

```
   [ NEW ]
      │ (Upload de currículo)
      ▼
 [ SCREENING ]
      │ (Avaliação por IA)
      ├────────────────────────┐
      ▼ (Score >= 7.0)         ▼ (Score < 5.0 ou Reprovação manual)
[ SCREENING_APPROVED ]    [ REJECTED ]
      │ (Atribuição de Teste)
      ▼
   [ TEST ]
      │ (Submissão e correção das respostas)
      ├────────────────────────┐
      ▼ (Score >= 7.0)         ▼ (Score < 7.0)
 [ TEST_APPROVED ]        [ REJECTED ]
      │ (Agendamento de Entrevista)
      ▼
 [ INTERVIEW ]
      │ (Decisão final da comissão avaliadora)
      ├────────────────────────┐
      ▼                        ▼
  [ HIRED ]               [ REJECTED ]
```

---

## 4. Regras de Negócio Oficiais

### RN-01 — Pesos e Critérios de Avaliação
- Os pesos dos critérios de triagem por IA na vaga (`educationWeight`, `automationWeight`, `dataWeight`, `experienceWeight`, `technologyWeight`, `behavioralWeight`) devem somar **obrigatoriamente 100%**.
- Os pesos do ranking consolidado (`rankingResumeWeight`, `rankingTestWeight`) devem somar **obrigatoriamente 100%**.

### RN-02 — Triagem e Extração de Texto
- O upload de currículos aceita exclusivamente arquivos nos formatos PDF (`application/pdf`) e TXT (`text/plain`), com limite estrito de **5 MB**.
- Apenas currículos com texto extraído válido podem ser submetidos à triagem por IA.
- Ao enviar um novo currículo para a mesma vaga, os currículos anteriores do candidato são automaticamente desativados (`isActive: false`).

### RN-03 — Testes Técnicos
- Apenas testes em status `PUBLISHED` podem ser atribuídos a candidatos.
- Questões de múltipla escolha e verdadeiro/falso exigem lista de opções e gabarito definido (`correctAnswer`).

### RN-04 — Correção Automática e Aprovação em Testes
- Questões objetivas são corrigidas instantaneamente por comparação de gabarito e cálculo ponderado pelo peso de cada questão.
- O score final é normalizado em escala de 0 a 10.
- Candidatos com nota igual ou superior a **7.0** têm seu status atualizado automaticamente para `TEST_APPROVED`.

### RN-05 — Ranking Consolidado
- O ranking pondera os scores de currículo e teste técnico de acordo com a configuração da vaga:
  $$\text{finalScore} = \text{resumeScore} \times \left(\frac{\text{rankingResumeWeight}}{100}\right) + \text{testScore} \times \left(\frac{\text{rankingTestWeight}}{100}\right)$$
- Candidatos com notas iguais recebem a mesma posição no ranking (`tie handling`).

### RN-06 — Agendamento de Entrevistas
- Uma entrevista só pode ser criada para candidatos que já tenham atingido o status `TEST_APPROVED` (ou que já se encontrem em `INTERVIEW`).
- A vaga deve estar aberta (`OPEN`).
- Ao agendar com sucesso, o status do candidato transiciona para `INTERVIEW`.

### RN-07 — Governança e Segurança de IA
- O texto do currículo é sanitizado e limitado em 20.000 caracteres para proteção de contexto e prevenção contra DoS.
- O prompt é blindado com instruções estritas para ignorar tentativas de Prompt Injection embutidas nos currículos.
