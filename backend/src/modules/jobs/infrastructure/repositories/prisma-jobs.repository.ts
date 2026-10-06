import { Injectable } from '@nestjs/common';
import { Job, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  IJobsRepository,
  CreateJobInput,
  UpdateJobInput,
  ListJobsQuery,
  PaginatedJobsResult,
} from '../../domain/jobs.repository.interface';

@Injectable()
export class PrismaJobsRepository implements IJobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateJobInput): Promise<Job> {
    return this.prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        desiredSkills: data.desiredSkills ?? [],
        experienceLevel: data.experienceLevel,
        educationWeight: data.educationWeight ?? 15,
        automationWeight: data.automationWeight ?? 20,
        dataWeight: data.dataWeight ?? 20,
        experienceWeight: data.experienceWeight ?? 20,
        technologyWeight: data.technologyWeight ?? 15,
        behavioralWeight: data.behavioralWeight ?? 10,
        rankingResumeWeight: data.rankingResumeWeight ?? 60,
        rankingTestWeight: data.rankingTestWeight ?? 40,
      },
    });
  }

  async findById(id: string): Promise<Job | null> {
    return this.prisma.job.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findAll(query: ListJobsQuery): Promise<PaginatedJobsResult> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, Math.min(100, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { requirements: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      jobs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: string, data: UpdateJobInput): Promise<Job> {
    return this.prisma.job.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: any): Promise<Job> {
    return this.prisma.job.update({
      where: { id },
      data: { status },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.job.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
