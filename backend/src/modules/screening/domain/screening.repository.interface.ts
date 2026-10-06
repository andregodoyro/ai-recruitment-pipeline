import { Evaluation, Recommendation } from '@prisma/client';

export interface CreateEvaluationInput {
  candidateId: string;
  jobId: string;
  resumeId: string;
  educationScore: number;
  automationScore: number;
  dataScore: number;
  experienceScore: number;
  technologyScore: number;
  behavioralScore: number;
  finalScore: number;
  strengths: string[];
  gaps: string[];
  justification: string;
  recommendation: Recommendation;
  promptVersion: string;
  aiModel: string;
  rawAiResponse: string;
}

export const SCREENING_REPOSITORY = 'SCREENING_REPOSITORY';

export interface IScreeningRepository {
  create(data: CreateEvaluationInput): Promise<Evaluation>;
  findById(id: string): Promise<Evaluation | null>;
  findByJobId(jobId: string): Promise<Evaluation[]>;
  findByCandidateId(candidateId: string): Promise<Evaluation[]>;
}
