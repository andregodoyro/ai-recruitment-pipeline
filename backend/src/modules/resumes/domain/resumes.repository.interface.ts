import { Resume } from '@prisma/client';

export interface CreateResumeInput {
  candidateId: string;
  jobId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  extractedText?: string;
  isActive?: boolean;
}

export const RESUMES_REPOSITORY = 'RESUMES_REPOSITORY';

export interface IResumesRepository {
  create(data: CreateResumeInput): Promise<Resume>;
  findById(id: string): Promise<Resume | null>;
  findByCandidateId(candidateId: string): Promise<Resume[]>;
  findByCandidateAndJob(candidateId: string, jobId: string): Promise<Resume[]>;
  deactivatePreviousResumes(candidateId: string, jobId: string): Promise<void>;
}
