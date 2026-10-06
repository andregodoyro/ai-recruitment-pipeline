import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  ITestsRepository,
  CreateTestInput,
  UpdateTestInput,
  ListTestsQuery,
  PaginatedTestsResult,
} from '../../domain/tests.repository.interface';
import { Test, TestStatus } from '@prisma/client';

@Injectable()
export class PrismaTestsRepository implements ITestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTestInput): Promise<Test> {
    return this.prisma.test.create({
      data: {
        jobId: data.jobId,
        title: data.title,
        description: data.description,
        status: TestStatus.DRAFT,
      },
    });
  }

  async findById(id: string): Promise<Test | null> {
    return this.prisma.test.findUnique({
      where: { id },
    });
  }

  async findAll(query: ListTestsQuery): Promise<PaginatedTestsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.jobId) where.jobId = query.jobId;
    if (query.status) where.status = query.status;

    const [tests, total] = await Promise.all([
      this.prisma.test.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.test.count({ where }),
    ]);

    return {
      tests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async update(id: string, data: UpdateTestInput): Promise<Test> {
    return this.prisma.test.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: TestStatus): Promise<Test> {
    return this.prisma.test.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.test.delete({
      where: { id },
    });
  }
}
