import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IRankingRepository,
  RANKING_REPOSITORY,
  RankingEntry,
} from '../../domain/ranking.repository.interface';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../../jobs/domain/jobs.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';

@Injectable()
export class GetJobRankingUseCase {
  constructor(
    @Inject(RANKING_REPOSITORY)
    private readonly rankingRepository: IRankingRepository,
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(jobId: string): Promise<RankingEntry[]> {
    const job = await this.jobsRepository.findById(jobId);
    if (!job) {
      throw new NotFoundException(`Vaga com ID '${jobId}' não foi encontrada.`);
    }

    const resumeWeight = job.rankingResumeWeight / 100;
    const testWeight = job.rankingTestWeight / 100;

    // Fetch all evaluations for this job (one per candidate, latest/highest)
    const evaluations = await this.rankingRepository.findEvaluationsByJobId(jobId);

    // Fetch all graded candidate tests for this job
    const candidateTests = await this.rankingRepository.findCandidateTestsByJobId(jobId);

    // Build a map of candidateId → best evaluation (already ordered desc by finalScore)
    const evalMap = new Map<string, typeof evaluations[0]>();
    for (const ev of evaluations) {
      if (!evalMap.has(ev.candidateId)) {
        evalMap.set(ev.candidateId, ev);
      }
    }

    // Build a map of candidateId → best test score (already ordered desc by score)
    const testMap = new Map<string, typeof candidateTests[0]>();
    for (const ct of candidateTests) {
      if (!testMap.has(ct.candidateId)) {
        testMap.set(ct.candidateId, ct);
      }
    }

    // Union of all candidateIds that have at least an evaluation
    const candidateIds = [...evalMap.keys()];

    // Compute entries
    const entries: RankingEntry[] = [];

    for (const candidateId of candidateIds) {
      const candidate = await this.candidatesRepository.findById(candidateId);
      if (!candidate) continue;

      const evaluation = evalMap.get(candidateId) ?? null;
      const candidateTest = testMap.get(candidateId) ?? null;

      const resumeScore = evaluation?.finalScore ?? null;
      const testScore = candidateTest?.score ?? null;

      // finalScore formula:
      // - If both scores exist: resumeScore * weight + testScore * weight
      // - If only resumeScore: resumeScore * 1.0 (test not assigned yet)
      // - If only testScore: testScore * 1.0 (edge case, unlikely)
      let finalScore: number;
      if (resumeScore !== null && testScore !== null) {
        finalScore = Number(
          (resumeScore * resumeWeight + testScore * testWeight).toFixed(2),
        );
      } else if (resumeScore !== null) {
        finalScore = Number(resumeScore.toFixed(2));
      } else if (testScore !== null) {
        finalScore = Number(testScore.toFixed(2));
      } else {
        finalScore = 0;
      }

      entries.push({
        candidateId,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        jobId,
        resumeScore,
        testScore,
        finalScore,
        rankingPosition: 0, // will be set after sorting
        evaluation,
        candidateTest,
      });
    }

    // Sort descending by finalScore
    entries.sort((a, b) => b.finalScore - a.finalScore);

    // Assign positions (ties share the same position)
    let pos = 1;
    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].finalScore < entries[i - 1].finalScore) {
        pos = i + 1;
      }
      entries[i].rankingPosition = pos;
    }

    return entries;
  }
}
