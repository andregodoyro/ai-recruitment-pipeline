/**
 * Interface para o serviço de avaliação de currículos por IA.
 *
 * Esta interface é definida no domínio da aplicação e deve ser implementada
 * na camada de infraestrutura (ex: OpenAIRecruitmentEvaluator).
 *
 * Isso garante que o provedor de IA pode ser trocado sem alterar
 * nenhuma regra de negócio.
 */

export interface AiEvaluationInput {
  candidateId: string;
  jobId: string;
  resumeId: string;

  // Dados da vaga
  jobTitle: string;
  jobDescription: string;
  requirements: string;
  desiredSkills: string[];
  experienceLevel: string;

  // Pesos dos critérios (somam 100)
  educationWeight: number;
  automationWeight: number;
  dataWeight: number;
  experienceWeight: number;
  technologyWeight: number;
  behavioralWeight: number;

  // Conteúdo do currículo
  resumeText: string;
}

export interface AiEvaluationScores {
  education: number;    // 0-10
  automation: number;   // 0-10
  data: number;         // 0-10
  experience: number;   // 0-10
  technology: number;   // 0-10
  behavioral: number;   // 0-10
}

export type AiRecommendation = 'APPROVED' | 'REJECTED' | 'REVIEW';

export interface AiEvaluationResult {
  scores: AiEvaluationScores;
  finalScore: number;
  strengths: string[];
  gaps: string[];
  justification: string;
  recommendation: AiRecommendation;

  // Rastreabilidade
  promptVersion: string;
  aiModel: string;
  rawResponse: string;
}

/**
 * Contrato da abstração de IA para recrutamento.
 * Implementado em: infrastructure/ai/openai-evaluator.ts
 */
export interface IAIRecruitmentEvaluator {
  evaluate(input: AiEvaluationInput): Promise<AiEvaluationResult>;
}

/**
 * Token de injeção de dependência para o IAIRecruitmentEvaluator.
 * Use este token no NestJS @Inject() para injetar a implementação concreta.
 */
export const AI_RECRUITMENT_EVALUATOR = Symbol('IAIRecruitmentEvaluator');
