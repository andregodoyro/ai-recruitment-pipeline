import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  IAIRecruitmentEvaluator,
  AiEvaluationInput,
  AiEvaluationResult,
  AiRecommendation,
  AiEvaluationScores,
} from '../interfaces/ai-evaluator.interface';
import {
  PROMPT_VERSION,
  buildScreeningPrompt,
} from '../prompts/resume-screening.v1';

@Injectable()
export class OpenAiEvaluatorService implements IAIRecruitmentEvaluator {
  private readonly logger = new Logger(OpenAiEvaluatorService.name);
  private openai: OpenAI | null = null;
  private readonly modelName: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.modelName = this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
    this.timeoutMs = Number(this.configService.get<number>('OPENAI_TIMEOUT_MS') ?? 30000);

    if (apiKey && apiKey !== 'sk-your-key-here' && apiKey.startsWith('sk-')) {
      this.openai = new OpenAI({
        apiKey,
        timeout: this.timeoutMs,
      });
      this.logger.log(`🤖 OpenAI Client inicializado com modelo: ${this.modelName}`);
    } else {
      this.logger.warn('⚠️ OPENAI_API_KEY não configurada ou inválida. O serviço funcionará em modo fallback/simulado.');
    }
  }

  async evaluate(input: AiEvaluationInput): Promise<AiEvaluationResult> {
    const promptText = buildScreeningPrompt({
      jobTitle: input.jobTitle,
      jobDescription: input.jobDescription,
      requirements: input.requirements,
      desiredSkills: input.desiredSkills.join(', '),
      experienceLevel: input.experienceLevel,
      educationWeight: input.educationWeight,
      automationWeight: input.automationWeight,
      dataWeight: input.dataWeight,
      experienceWeight: input.experienceWeight,
      technologyWeight: input.technologyWeight,
      behavioralWeight: input.behavioralWeight,
      resumeText: input.resumeText,
    });

    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: 'Você é um avaliador técnico especialista que responde apenas em formato JSON estrito.',
            },
            {
              role: 'user',
              content: promptText,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const rawContent = response.choices[0]?.message?.content ?? '{}';
        const parsed = JSON.parse(rawContent);

        const scores = this.normalizeScores(parsed.scores);
        const finalScore = this.calculateFinalScore(scores, input);
        const recommendation = this.determineRecommendation(finalScore, parsed.recommendation);

        return {
          scores,
          finalScore,
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
          justification: parsed.justification ?? 'Avaliação realizada pela inteligência artificial.',
          recommendation,
          promptVersion: PROMPT_VERSION,
          aiModel: this.modelName,
          rawResponse: rawContent,
        };
      } catch (error) {
        this.logger.error(`❌ Erro ao chamar API da OpenAI: ${(error as Error).message}`);
        throw new InternalServerErrorException(
          `Falha ao realizar triagem por IA: ${(error as Error).message}`,
        );
      }
    }

    // Fallback simulado para desenvolvimento local/testes sem API Key real
    return this.fallbackEvaluation(input, promptText);
  }

  private normalizeScores(rawScores: any): AiEvaluationScores {
    const clamp = (val: any) => {
      const num = Number(val);
      if (isNaN(num)) return 5.0;
      return Math.min(10.0, Math.max(0.0, num));
    };

    return {
      education: clamp(rawScores?.education),
      automation: clamp(rawScores?.automation),
      data: clamp(rawScores?.data),
      experience: clamp(rawScores?.experience),
      technology: clamp(rawScores?.technology),
      behavioral: clamp(rawScores?.behavioral),
    };
  }

  private calculateFinalScore(
    scores: AiEvaluationScores,
    input: AiEvaluationInput,
  ): number {
    const weightedSum =
      scores.education * input.educationWeight +
      scores.automation * input.automationWeight +
      scores.data * input.dataWeight +
      scores.experience * input.experienceWeight +
      scores.technology * input.technologyWeight +
      scores.behavioral * input.behavioralWeight;

    return Number((weightedSum / 100).toFixed(2));
  }

  private determineRecommendation(
    finalScore: number,
    rawRec?: string,
  ): AiRecommendation {
    if (rawRec === 'APPROVED' || rawRec === 'REJECTED' || rawRec === 'REVIEW') {
      return rawRec as AiRecommendation;
    }
    if (finalScore >= 7.0) return 'APPROVED';
    if (finalScore >= 5.0) return 'REVIEW';
    return 'REJECTED';
  }

  private fallbackEvaluation(
    input: AiEvaluationInput,
    promptText: string,
  ): AiEvaluationResult {
    const textLen = input.resumeText.length;
    const baseScore = textLen > 200 ? 7.5 : 5.0;

    const scores: AiEvaluationScores = {
      education: baseScore,
      automation: baseScore,
      data: baseScore,
      experience: baseScore,
      technology: baseScore,
      behavioral: baseScore,
    };

    const finalScore = this.calculateFinalScore(scores, input);
    const recommendation: AiRecommendation = finalScore >= 7.0 ? 'APPROVED' : 'REVIEW';

    const fallbackJson = JSON.stringify({
      scores,
      finalScore,
      strengths: ['Currículo anexado com formato válido', 'Texto extraído com sucesso'],
      gaps: ['Avaliação realizada em modo fallback de desenvolvimento'],
      justification: 'Triagem gerada no modo de desenvolvimento por ausência de chave de API OpenAI.',
      recommendation,
    });

    return {
      scores,
      finalScore,
      strengths: ['Currículo com texto legível', 'Experiência relevante identificada'],
      gaps: ['Avaliação efetuada sem conexão ativa à API OpenAI'],
      justification: 'Triagem em modo offline de desenvolvimento. Recomenda-se configurar a OPENAI_API_KEY para análises avançadas.',
      recommendation,
      promptVersion: PROMPT_VERSION,
      aiModel: 'fallback-simulated',
      rawResponse: fallbackJson,
    };
  }
}
