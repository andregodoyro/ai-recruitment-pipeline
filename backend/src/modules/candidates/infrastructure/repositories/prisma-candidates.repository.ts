import { Injectable } from '@nestjs/common';
import { Candidate, CandidateStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  ICandidatesRepository,
  CreateCandidateInput,
  UpdateCandidateInput,
  ListCandidatesQuery,
  PaginatedCandidatesResult,
} from '../../domain/candidates.repository.interface';

@Injectable()
export class PrismaCandidatesRepository implements ICandidatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCandidateInput): Promise<Candidate> {
    return this.prisma.candidate.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: CandidateStatus.NEW,
      },
    });
  }

  async findById(id: string): Promise<Candidate | null> {
    return this.prisma.candidate.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        resumes: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return this.prisma.candidate.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findAll(query: ListCandidatesQuery): Promise<PaginatedCandidatesResult> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, Math.min(100, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.CandidateWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          resumes: {
            take: 1,
            orderBy: { uploadedAt: 'desc' },
          },
        },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      candidates,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: string, data: UpdateCandidateInput): Promise<Candidate> {
    return this.prisma.candidate.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    return this.prisma.candidate.update({
      where: { id },
      data: { status },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.candidate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
