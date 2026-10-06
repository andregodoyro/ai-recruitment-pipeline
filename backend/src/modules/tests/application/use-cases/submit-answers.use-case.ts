import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CandidateStatus, CandidateTestStatus, QuestionType } from '@prisma/client';
import {
  ICandidateTestsRepository,
  CANDIDATE_TESTS_REPOSITORY,
  CandidateTestWithAnswers,
} from '../../domain/candidate-tests.repository.interface';
import {
  IQuestionsRepository,
  QUESTIONS_REPOSITORY,
} from '../../domain/questions.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';
import { SubmitAnswersDto } from '../dtos/submit-answers.dto';

@Injectable()
export class SubmitAnswersUseCase {
  constructor(
    @Inject(CANDIDATE_TESTS_REPOSITORY)
    private readonly candidateTestsRepository: ICandidateTestsRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(candidateTestId: string, dto: SubmitAnswersDto): Promise<CandidateTestWithAnswers> {
    const candidateTest = await this.candidateTestsRepository.findById(candidateTestId);
    if (!candidateTest) {
      throw new NotFoundException(`Aplicação de teste com ID '${candidateTestId}' não foi encontrada.`);
    }

    if (candidateTest.status === CandidateTestStatus.SUBMITTED || candidateTest.status === CandidateTestStatus.GRADED) {
      throw new BadRequestException('Este teste já foi submetido anteriormente.');
    }

    const testQuestions = await this.questionsRepository.findByTestId(candidateTest.testId);
    const questionsMap = new Map(testQuestions.map((q) => [q.id, q]));

    // Auto-grading calculations
    let totalScoreWeight = 0;
    let earnedScoreWeight = 0;

    for (const ans of dto.answers) {
      const question = questionsMap.get(ans.questionId);
      if (!question) continue;

      if (
        question.type === QuestionType.MULTIPLE_CHOICE ||
        question.type === QuestionType.TRUE_FALSE
      ) {
        totalScoreWeight += question.weight;
        const isCorrect =
          ans.answerText !== undefined &&
          ans.answerText !== null &&
          question.correctAnswer !== null &&
          ans.answerText.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

        if (isCorrect) {
          earnedScoreWeight += question.weight;
        }
      }
    }

    const finalScore = totalScoreWeight > 0
      ? Number(((earnedScoreWeight / totalScoreWeight) * 10).toFixed(2))
      : 10.0;

    // Persist answers
    const updatedCandidateTest = await this.candidateTestsRepository.submitAnswers(
      candidateTestId,
      dto.answers,
    );

    // Update status to GRADED and set score
    await this.candidateTestsRepository.updateStatus(
      candidateTestId,
      CandidateTestStatus.GRADED,
      finalScore,
    );

    // If score >= 7.0, update candidate status to TEST_APPROVED
    if (finalScore >= 7.0) {
      await this.candidatesRepository.updateStatus(
        candidateTest.candidateId,
        CandidateStatus.TEST_APPROVED,
      );
    }

    return {
      ...updatedCandidateTest,
      score: finalScore,
      status: CandidateTestStatus.GRADED,
    };
  }
}
