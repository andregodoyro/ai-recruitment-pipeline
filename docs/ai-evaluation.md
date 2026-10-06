# Avaliação por Inteligência Artificial

## 1. Visão Geral

A camada de inteligência artificial é responsável por analisar o currículo do candidato e confrontá-lo com os requisitos e critérios técnicos e comportamentais da vaga selecionada.

A integração é baseada no princípio de **Inversão de Dependência**, permitindo trocar o provedor de IA facilmente ou operar em modo offline/fallback durante o desenvolvimento e testes automatizados.

---

## 2. Abstração e Interfaces

- **Contrato:** `IAIRecruitmentEvaluator` em `src/ai/interfaces/ai-evaluator.interface.ts`.
- **Token de Injeção:** `AI_RECRUITMENT_EVALUATOR`.
- **Implementação Padrão:** `OpenAiEvaluatorService` em `src/ai/services/openai-evaluator.service.ts`.

```typescript
export interface IAIRecruitmentEvaluator {
  evaluate(input: AiEvaluationInput): Promise<AiEvaluationResult>;
}
```

---

## 3. Modo Fallback (Offline)

Quando a variável de ambiente `OPENAI_API_KEY` não está definida ou não contém uma chave real da OpenAI, o serviço opera de maneira resiliente em modo **fallback determinístico**:
- Não interrompe a execução da aplicação ou dos testes;
- Avalia a completude do texto do currículo;
- Gera scores balanceados e ponderados pelos pesos da vaga;
- Retorna justificativas claras informando o modo offline;
- Permite que todo o ciclo de desenvolvimento, CI/CD e testes E2E rodem sem custos com API externa.

---

## 4. Prompt Engineering e Versionamento

Os prompts utilizados pela IA são versionados em arquivos dedicados (`src/ai/prompts/resume-screening.v1.ts`), garantindo rastreabilidade histórica das decisões de triagem.

Cada registro de `Evaluation` armazena no banco de dados:
- `promptVersion`: Versão do prompt utilizado na avaliação (ex: `1.0.0`).
- `aiModel`: Modelo de LLM empregado (ex: `gpt-4o-mini`).
- `rawAiResponse`: Resposta JSON bruta emitida pelo modelo para fins de auditoria.

---

## 5. Medidas de Segurança Adotadas

1. **Prevenção contra Prompt Injection:** O prompt contém instruções explícitas instruindo o modelo a tratar o conteúdo do currículo estritamente como dados passivos não confiáveis, ignorando quaisquer comandos embutidos no texto que tentem sobrescrever critérios ou notas.
2. **Sanitização de Tamanho (Proteção contra DoS):** Textos de currículo são limitados a 20.000 caracteres antes do envio à API externa, evitando estouro de janela de contexto e consumo excessivo de tokens.
3. **Formatação Estrita:** Utilização de `response_format: { type: "json_object" }` garantindo que o modelo responda exclusivamente em JSON válido.
4. **Normalização e Clamping de Notas:** Todos os valores retornados passam por funções de sanitização que forçam o intervalo estrito de `[0.0, 10.0]`.
