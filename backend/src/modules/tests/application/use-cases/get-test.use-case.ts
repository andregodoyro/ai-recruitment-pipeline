import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Test } from '@prisma/client';
import {
  ITestsRepository,
  TESTS_REPOSITORY,
} from '../../domain/tests.repository.interface';

@Injectable()
export class GetTestUseCase {
  constructor(
    @Inject(TESTS_REPOSITORY)
    private readonly testsRepository: ITestsRepository,
  ) {}

  async execute(id: string): Promise<Test> {
    const test = await this.testsRepository.findById(id);
    if (!test) {
      throw new NotFoundException(`Teste com ID '${id}' não foi encontrado.`);
    }
    return test;
  }
}
