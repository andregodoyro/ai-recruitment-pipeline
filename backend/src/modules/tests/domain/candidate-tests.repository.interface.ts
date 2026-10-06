import { CandidateTest, CandidateAnswer, CandidateTestStatus } from '@prisma/client';

export interface CandidateTestWithAnswers extends CandidateTest {
  answers: CandidateAnswer[];
}

export interface SubmitAnswerInput {
  questionId: string;
  answerText?: string;
}

export const CANDIDATE_TESTS_REPOSITORY = 'CANDIDATE_TESTS_REPOSITORY';

export interface ICandidateTestsRepository {
  assign(candidateId: string, testId: string): Promise<CandidateTest>;
  findById(id: string): Promise<CandidateTestWithAnswers | null>;
  findByCandidateId(candidateId: string): Promise<CandidateTest[]>;
  findByTestId(testId: string): Promise<CandidateTest[]>;
  findByCandidateAndTest(candidateId: string, testId: string): Promise<CandidateTest | null>;
  updateStatus(id: string, status: CandidateTestStatus, score?: number): Promise<CandidateTest>;
  submitAnswers(candidateTestId: string, answers: SubmitAnswerInput[]): Promise<CandidateTestWithAnswers>;
}
