import { Injectable } from '@nestjs/common';
import { Evaluation } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  IScreeningRepository,
  CreateEvaluationInput,
} from '../../domain/screening.repository.interface';

@Injectable()
export class PrismaScreeningRepository implements IScreeningRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEvaluationInput): Promise<Evaluation> {
    return this.prisma.evaluation.create({
      data: {
        candidateId: data.candidateId,
        jobId: data.jobId,
        resumeId: data.resumeId,
        educationScore: data.educationScore,
        automationScore: data.automationScore,
        dataScore: data.dataScore,
        experienceScore: data.experienceScore,
        technologyScore: data.technologyScore,
        behavioralScore: data.behavioralScore,
        finalScore: data.finalScore,
        strengths: data.strengths,
        gaps: data.gaps,
        justification: data.justification,
        recommendation: data.recommendation,
        promptVersion: data.promptVersion,
        aiModel: data.aiModel,
        rawAiResponse: data.rawAiResponse,
      },
    });
  }

  async findById(id: string): Promise<Evaluation | null> {
    return this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
        resume: true,
      },
    });
  }

  async findByJobId(jobId: string): Promise<Evaluation[]> {
    return this.prisma.evaluation.findMany({
      where: { jobId },
      orderBy: { finalScore: 'desc' },
      include: {
        candidate: true,
        resume: true,
      },
    });
  }

  async findByCandidateId(candidateId: string): Promise<Evaluation[]> {
    return this.prisma.evaluation.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: true,
      },
    });
  }
}
