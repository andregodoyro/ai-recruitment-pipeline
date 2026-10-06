import { Interview, InterviewStatus } from '@prisma/client';

export interface CreateInterviewInput {
  candidateId: string;
  jobId: string;
  scheduledAt: Date;
  meetingUrl?: string;
  notes?: string;
}

export interface UpdateInterviewInput {
  scheduledAt?: Date;
  meetingUrl?: string;
  status?: InterviewStatus;
  notes?: string;
}

export interface ListInterviewsQuery {
  jobId?: string;
  candidateId?: string;
  status?: InterviewStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedInterviewsResult {
  interviews: Interview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const INTERVIEWS_REPOSITORY = 'INTERVIEWS_REPOSITORY';

export interface IInterviewsRepository {
  create(data: CreateInterviewInput): Promise<Interview>;
  findById(id: string): Promise<Interview | null>;
  findAll(query: ListInterviewsQuery): Promise<PaginatedInterviewsResult>;
  findByJobId(jobId: string): Promise<Interview[]>;
  findByCandidateId(candidateId: string): Promise<Interview[]>;
  update(id: string, data: UpdateInterviewInput): Promise<Interview>;
  updateStatus(id: string, status: InterviewStatus): Promise<Interview>;
  delete(id: string): Promise<void>;
}
