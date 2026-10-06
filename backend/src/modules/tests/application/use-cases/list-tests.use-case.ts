import { Injectable, Inject } from '@nestjs/common';
import {
  ITestsRepository,
  TESTS_REPOSITORY,
  ListTestsQuery,
  PaginatedTestsResult,
} from '../../domain/tests.repository.interface';
import { TestStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ListTestsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por UUID da vaga' })
  @IsUUID()
  @IsOptional()
  jobId?: string;

  @ApiPropertyOptional({ enum: TestStatus, description: 'Filtrar por status' })
  @IsEnum(TestStatus)
  @IsOptional()
  status?: TestStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}

@Injectable()
export class ListTestsUseCase {
  constructor(
    @Inject(TESTS_REPOSITORY)
    private readonly testsRepository: ITestsRepository,
  ) {}

  async execute(query: ListTestsQuery): Promise<PaginatedTestsResult> {
    return this.testsRepository.findAll(query);
  }
}
