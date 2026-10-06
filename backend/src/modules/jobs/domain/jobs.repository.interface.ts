import { Job, ExperienceLevel, JobStatus } from '@prisma/client';

export interface CreateJobInput {
  title: string;
  description: string;
  requirements: string;
  desiredSkills?: string[];
  experienceLevel: ExperienceLevel;
  educationWeight?: number;
  automationWeight?: number;
  dataWeight?: number;
  experienceWeight?: number;
  technologyWeight?: number;
  behavioralWeight?: number;
  rankingResumeWeight?: number;
  rankingTestWeight?: number;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  requirements?: string;
  desiredSkills?: string[];
  experienceLevel?: ExperienceLevel;
  status?: JobStatus;
  educationWeight?: number;
  automationWeight?: number;
  dataWeight?: number;
  experienceWeight?: number;
  technologyWeight?: number;
  behavioralWeight?: number;
  rankingResumeWeight?: number;
  rankingTestWeight?: number;
}

export interface ListJobsQuery {
  page?: number;
  limit?: number;
  status?: JobStatus;
  search?: string;
}

export interface PaginatedJobsResult {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const JOBS_REPOSITORY = 'JOBS_REPOSITORY';

export interface IJobsRepository {
  create(data: CreateJobInput): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findAll(query: ListJobsQuery): Promise<PaginatedJobsResult>;
  update(id: string, data: UpdateJobInput): Promise<Job>;
  updateStatus(id: string, status: JobStatus): Promise<Job>;
  softDelete(id: string): Promise<void>;
}
