import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ITestsRepository,
  TESTS_REPOSITORY,
} from '../../domain/tests.repository.interface';

@Injectable()
export class DeleteTestUseCase {
  constructor(
    @Inject(TESTS_REPOSITORY)
    private readonly testsRepository: ITestsRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const test = await this.testsRepository.findById(id);
    if (!test) {
      throw new NotFoundException(`Teste com ID '${id}' não foi encontrado.`);
    }

    await this.testsRepository.delete(id);
  }
}
