import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IRankingRepository,
  RANKING_REPOSITORY,
  RankingEntry,
} from '../../domain/ranking.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../../jobs/domain/jobs.repository.interface';

@Injectable()
export class GetCandidateRankingPositionUseCase {
  constructor(
    @Inject(RANKING_REPOSITORY)
    private readonly rankingRepository: IRankingRepository,
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(jobId: string, candidateId: string): Promise<RankingEntry | null> {
    const job = await this.jobsRepository.findById(jobId);
    if (!job) {
      throw new NotFoundException(`Vaga com ID '${jobId}' não foi encontrada.`);
    }

    const candidate = await this.candidatesRepository.findById(candidateId);
    if (!candidate) {
      throw new NotFoundException(`Candidato com ID '${candidateId}' não foi encontrado.`);
    }

    const resumeWeight = job.rankingResumeWeight / 100;
    const testWeight = job.rankingTestWeight / 100;

    const evaluations = await this.rankingRepository.findEvaluationsByJobId(jobId);
    const candidateTests = await this.rankingRepository.findCandidateTestsByJobId(jobId);

    // Build maps
    const evalMap = new Map<string, typeof evaluations[0]>();
    for (const ev of evaluations) {
      if (!evalMap.has(ev.candidateId)) evalMap.set(ev.candidateId, ev);
    }
    const testMap = new Map<string, typeof candidateTests[0]>();
    for (const ct of candidateTests) {
      if (!testMap.has(ct.candidateId)) testMap.set(ct.candidateId, ct);
    }

    // Compute scores for all candidates (need all to determine position)
    const allScores: { candidateId: string; finalScore: number }[] = [];
    for (const [cId, ev] of evalMap.entries()) {
      const resumeScore = ev.finalScore;
      const ct = testMap.get(cId);
      const testScore = ct?.score ?? null;

      let finalScore: number;
      if (testScore !== null) {
        finalScore = Number((resumeScore * resumeWeight + testScore * testWeight).toFixed(2));
      } else {
        finalScore = Number(resumeScore.toFixed(2));
      }
      allScores.push({ candidateId: cId, finalScore });
    }

    // Sort descending
    allScores.sort((a, b) => b.finalScore - a.finalScore);

    const candidateEntry = allScores.find((s) => s.candidateId === candidateId);
    if (!candidateEntry) return null;

    // Determine position with tie handling
    let pos = 1;
    for (let i = 0; i < allScores.length; i++) {
      if (i > 0 && allScores[i].finalScore < allScores[i - 1].finalScore) {
        pos = i + 1;
      }
      if (allScores[i].candidateId === candidateId) {
        pos = pos;
        break;
      }
    }

    const evaluation = evalMap.get(candidateId) ?? null;
    const candidateTest = testMap.get(candidateId) ?? null;

    return {
      candidateId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobId,
      resumeScore: evaluation?.finalScore ?? null,
      testScore: candidateTest?.score ?? null,
      finalScore: candidateEntry.finalScore,
      rankingPosition: pos,
      evaluation,
      candidateTest,
    };
  }
}
