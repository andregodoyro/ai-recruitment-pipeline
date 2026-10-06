import { Injectable } from '@nestjs/common';
import { Resume } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  IResumesRepository,
  CreateResumeInput,
} from '../../domain/resumes.repository.interface';

@Injectable()
export class PrismaResumesRepository implements IResumesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateResumeInput): Promise<Resume> {
    return this.prisma.resume.create({
      data: {
        candidateId: data.candidateId,
        jobId: data.jobId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        fileSizeBytes: data.fileSizeBytes,
        extractedText: data.extractedText,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findById(id: string): Promise<Resume | null> {
    return this.prisma.resume.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
      },
    });
  }

  async findByCandidateId(candidateId: string): Promise<Resume[]> {
    return this.prisma.resume.findMany({
      where: { candidateId },
      orderBy: { uploadedAt: 'desc' },
      include: { job: true },
    });
  }

  async findByCandidateAndJob(candidateId: string, jobId: string): Promise<Resume[]> {
    return this.prisma.resume.findMany({
      where: { candidateId, jobId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async deactivatePreviousResumes(candidateId: string, jobId: string): Promise<void> {
    await this.prisma.resume.updateMany({
      where: {
        candidateId,
        jobId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }
}
