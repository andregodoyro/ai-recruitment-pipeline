import { Test, TestStatus } from '@prisma/client';

export interface CreateTestInput {
  jobId: string;
  title: string;
  description?: string;
}

export interface UpdateTestInput {
  title?: string;
  description?: string;
}

export interface ListTestsQuery {
  jobId?: string;
  status?: TestStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedTestsResult {
  tests: Test[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const TESTS_REPOSITORY = 'TESTS_REPOSITORY';

export interface ITestsRepository {
  create(data: CreateTestInput): Promise<Test>;
  findById(id: string): Promise<Test | null>;
  findAll(query: ListTestsQuery): Promise<PaginatedTestsResult>;
  update(id: string, data: UpdateTestInput): Promise<Test>;
  updateStatus(id: string, status: TestStatus): Promise<Test>;
  delete(id: string): Promise<void>;
}
