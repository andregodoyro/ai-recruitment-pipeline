import { CandidateStatus } from '@prisma/client';

export interface DashboardMetrics {
  totalJobs: number;
  openJobs: number;
  totalCandidates: number;
  totalResumes: number;
  totalEvaluations: number;
  totalTests: number;
  totalInterviews: number;
  conversionRateHiredPercentage: number;
}

export interface CandidateFunnelStage {
  stage: CandidateStatus;
  label: string;
  count: number;
  percentageOfTotal: number;
}

export interface ScoreDistribution {
  range: string; // ex: '0-2', '2-4', '4-6', '6-8', '8-10'
  resumeCount: number;
  testCount: number;
}

export interface TopCandidateEntry {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  finalScore: number;
  resumeScore: number | null;
  testScore: number | null;
  status: CandidateStatus;
}

export interface DashboardOverview {
  metrics: DashboardMetrics;
  funnel: CandidateFunnelStage[];
  scoreDistribution: ScoreDistribution[];
  topCandidates: TopCandidateEntry[];
}

export interface DashboardFilterQuery {
  jobId?: string;
  startDate?: Date;
  endDate?: Date;
}

export const DASHBOARD_REPOSITORY = 'DASHBOARD_REPOSITORY';

export interface IDashboardRepository {
  getOverview(filter?: DashboardFilterQuery): Promise<DashboardOverview>;
}
