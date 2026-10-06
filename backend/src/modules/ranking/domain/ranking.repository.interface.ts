import { Evaluation, CandidateTest } from '@prisma/client';

export interface RankingEntry {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  resumeScore: number | null;
  testScore: number | null;
  finalScore: number;
  rankingPosition: number;
  evaluation: Evaluation | null;
  candidateTest: CandidateTest | null;
}

export interface GetJobRankingInput {
  jobId: string;
}

export const RANKING_REPOSITORY = 'RANKING_REPOSITORY';

export interface IRankingRepository {
  /**
   * Busca todas as avaliações de triagem de uma vaga
   */
  findEvaluationsByJobId(jobId: string): Promise<Evaluation[]>;

  /**
   * Busca todos os testes aplicados a candidatos de uma vaga (via testes vinculados à vaga)
   */
  findCandidateTestsByJobId(jobId: string): Promise<CandidateTest[]>;
}
