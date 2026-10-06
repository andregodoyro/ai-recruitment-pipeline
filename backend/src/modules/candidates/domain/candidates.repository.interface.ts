import { Candidate, CandidateStatus } from '@prisma/client';

export interface CreateCandidateInput {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateCandidateInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: CandidateStatus;
}

export interface ListCandidatesQuery {
  page?: number;
  limit?: number;
  status?: CandidateStatus;
  search?: string;
}

export interface PaginatedCandidatesResult {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CANDIDATES_REPOSITORY = 'CANDIDATES_REPOSITORY';

export interface ICandidatesRepository {
  create(data: CreateCandidateInput): Promise<Candidate>;
  findById(id: string): Promise<Candidate | null>;
  findByEmail(email: string): Promise<Candidate | null>;
  findAll(query: ListCandidatesQuery): Promise<PaginatedCandidatesResult>;
  update(id: string, data: UpdateCandidateInput): Promise<Candidate>;
  updateStatus(id: string, status: CandidateStatus): Promise<Candidate>;
  softDelete(id: string): Promise<void>;
}
