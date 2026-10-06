import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  IInterviewsRepository,
  CreateInterviewInput,
  UpdateInterviewInput,
  ListInterviewsQuery,
  PaginatedInterviewsResult,
} from '../../domain/interviews.repository.interface';
import { Interview, InterviewStatus } from '@prisma/client';

@Injectable()
export class PrismaInterviewsRepository implements IInterviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInterviewInput): Promise<Interview> {
    return this.prisma.interview.create({
      data: {
        candidateId: data.candidateId,
        jobId: data.jobId,
        scheduledAt: data.scheduledAt,
        meetingUrl: data.meetingUrl,
        notes: data.notes,
        status: InterviewStatus.SCHEDULED,
      },
    });
  }

  async findById(id: string): Promise<Interview | null> {
    return this.prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
      },
    });
  }

  async findAll(query: ListInterviewsQuery): Promise<PaginatedInterviewsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.jobId) where.jobId = query.jobId;
    if (query.candidateId) where.candidateId = query.candidateId;
    if (query.status) where.status = query.status;

    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          candidate: true,
          job: true,
        },
      }),
      this.prisma.interview.count({ where }),
    ]);

    return {
      interviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findByJobId(jobId: string): Promise<Interview[]> {
    return this.prisma.interview.findMany({
      where: { jobId },
      orderBy: { scheduledAt: 'asc' },
      include: { candidate: true },
    });
  }

  async findByCandidateId(candidateId: string): Promise<Interview[]> {
    return this.prisma.interview.findMany({
      where: { candidateId },
      orderBy: { scheduledAt: 'asc' },
      include: { job: true },
    });
  }

  async update(id: string, data: UpdateInterviewInput): Promise<Interview> {
    return this.prisma.interview.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: InterviewStatus): Promise<Interview> {
    return this.prisma.interview.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.interview.delete({
      where: { id },
    });
  }
}
