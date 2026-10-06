import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  IDashboardRepository,
  DashboardOverview,
  DashboardFilterQuery,
  CandidateFunnelStage,
  ScoreDistribution,
  TopCandidateEntry,
  DashboardMetrics,
} from '../../domain/dashboard.repository.interface';
import { CandidateStatus, JobStatus } from '@prisma/client';

@Injectable()
export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(filter?: DashboardFilterQuery): Promise<DashboardOverview> {
    const jobFilter = filter?.jobId ? { id: filter.jobId } : {};
    const dateFilter =
      filter?.startDate || filter?.endDate
        ? {
            createdAt: {
              gte: filter.startDate,
              lte: filter.endDate,
            },
          }
        : {};

    // 1. Métricas Gerais
    const [
      totalJobs,
      openJobs,
      totalCandidates,
      totalResumes,
      totalEvaluations,
      totalTests,
      totalInterviews,
      hiredCandidates,
    ] = await Promise.all([
      this.prisma.job.count({ where: { ...jobFilter, deletedAt: null } }),
      this.prisma.job.count({ where: { ...jobFilter, status: JobStatus.OPEN, deletedAt: null } }),
      this.prisma.candidate.count({ where: { deletedAt: null, ...dateFilter } }),
      this.prisma.resume.count({
        where: {
          ...(filter?.jobId ? { jobId: filter.jobId } : {}),
          ...dateFilter,
        },
      }),
      this.prisma.evaluation.count({
        where: {
          ...(filter?.jobId ? { jobId: filter.jobId } : {}),
          ...dateFilter,
        },
      }),
      this.prisma.candidateTest.count({
        where: {
          ...(filter?.jobId ? { test: { jobId: filter.jobId } } : {}),
          ...dateFilter,
        },
      }),
      this.prisma.interview.count({
        where: {
          ...(filter?.jobId ? { jobId: filter.jobId } : {}),
          ...dateFilter,
        },
      }),
      this.prisma.candidate.count({
        where: {
          status: CandidateStatus.HIRED,
          deletedAt: null,
          ...dateFilter,
        },
      }),
    ]);

    const conversionRateHiredPercentage =
      totalCandidates > 0 ? Number(((hiredCandidates / totalCandidates) * 100).toFixed(2)) : 0;

    const metrics: DashboardMetrics = {
      totalJobs,
      openJobs,
      totalCandidates,
      totalResumes,
      totalEvaluations,
      totalTests,
      totalInterviews,
      conversionRateHiredPercentage,
    };

    // 2. Funil de Candidatos
    const funnelStagesOrder: { stage: CandidateStatus; label: string }[] = [
      { stage: CandidateStatus.NEW, label: 'Novos Candidatos' },
      { stage: CandidateStatus.SCREENING, label: 'Em Triagem' },
      { stage: CandidateStatus.SCREENING_APPROVED, label: 'Triagem Aprovada' },
      { stage: CandidateStatus.TEST, label: 'Em Teste Técnico' },
      { stage: CandidateStatus.TEST_APPROVED, label: 'Teste Aprovado' },
      { stage: CandidateStatus.INTERVIEW, label: 'Em Entrevista' },
      { stage: CandidateStatus.HIRED, label: 'Contratados' },
      { stage: CandidateStatus.REJECTED, label: 'Desqualificados / Rejeitados' },
    ];

    const candidateCountsByStatus = await this.prisma.candidate.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { deletedAt: null, ...dateFilter },
    });

    const statusCountMap = new Map<CandidateStatus, number>();
    for (const item of candidateCountsByStatus) {
      statusCountMap.set(item.status, item._count.id);
    }

    const funnel: CandidateFunnelStage[] = funnelStagesOrder.map(({ stage, label }) => {
      const count = statusCountMap.get(stage) ?? 0;
      const percentageOfTotal =
        totalCandidates > 0 ? Number(((count / totalCandidates) * 100).toFixed(1)) : 0;
      return {
        stage,
        label,
        count,
        percentageOfTotal,
      };
    });

    // 3. Distribuição de Scores (0-2, 2-4, 4-6, 6-8, 8-10)
    const [evaluations, candidateTests] = await Promise.all([
      this.prisma.evaluation.findMany({
        where: {
          ...(filter?.jobId ? { jobId: filter.jobId } : {}),
          ...dateFilter,
        },
        select: { finalScore: true },
      }),
      this.prisma.candidateTest.findMany({
        where: {
          score: { not: null },
          ...(filter?.jobId ? { test: { jobId: filter.jobId } } : {}),
          ...dateFilter,
        },
        select: { score: true },
      }),
    ]);

    const ranges = [
      { range: '0-2', min: 0, max: 2 },
      { range: '2-4', min: 2, max: 4 },
      { range: '4-6', min: 4, max: 6 },
      { range: '6-8', min: 6, max: 8 },
      { range: '8-10', min: 8, max: 10.01 },
    ];

    const scoreDistribution: ScoreDistribution[] = ranges.map(({ range, min, max }) => {
      const resumeCount = evaluations.filter(
        (e) => e.finalScore >= min && (max > 10 ? e.finalScore <= 10 : e.finalScore < max),
      ).length;
      const testCount = candidateTests.filter(
        (t) => (t.score ?? 0) >= min && (max > 10 ? (t.score ?? 0) <= 10 : (t.score ?? 0) < max),
      ).length;
      return {
        range,
        resumeCount,
        testCount,
      };
    });

    // 4. Top Candidatos / Ranking Geral
    const topEvaluations = await this.prisma.evaluation.findMany({
      where: {
        ...(filter?.jobId ? { jobId: filter.jobId } : {}),
        ...dateFilter,
      },
      orderBy: { finalScore: 'desc' },
      take: 10,
      include: {
        candidate: true,
        job: true,
      },
    });

    const topCandidates: TopCandidateEntry[] = await Promise.all(
      topEvaluations.map(async (ev) => {
        const test = await this.prisma.candidateTest.findFirst({
          where: {
            candidateId: ev.candidateId,
            test: { jobId: ev.jobId },
          },
          select: { score: true },
        });

        const resumeScore = ev.finalScore;
        const testScore = test?.score ?? null;
        const resumeWeight = ev.job.rankingResumeWeight / 100;
        const testWeight = ev.job.rankingTestWeight / 100;

        let finalScore = resumeScore;
        if (testScore !== null) {
          finalScore = Number((resumeScore * resumeWeight + testScore * testWeight).toFixed(2));
        }

        return {
          candidateId: ev.candidateId,
          candidateName: ev.candidate.name,
          candidateEmail: ev.candidate.email,
          jobId: ev.jobId,
          jobTitle: ev.job.title,
          finalScore,
          resumeScore,
          testScore,
          status: ev.candidate.status,
        };
      }),
    );

    // Ordenar os top candidatos pelo score consolidado
    topCandidates.sort((a, b) => b.finalScore - a.finalScore);

    return {
      metrics,
      funnel,
      scoreDistribution,
      topCandidates,
    };
  }
}
