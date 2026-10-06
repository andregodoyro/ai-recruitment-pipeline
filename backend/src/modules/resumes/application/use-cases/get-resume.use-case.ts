import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Resume } from '@prisma/client';
import {
  IResumesRepository,
  RESUMES_REPOSITORY,
} from '../../domain/resumes.repository.interface';

@Injectable()
export class GetResumeUseCase {
  constructor(
    @Inject(RESUMES_REPOSITORY)
    private readonly resumesRepository: IResumesRepository,
  ) {}

  async execute(id: string): Promise<Resume> {
    const resume = await this.resumesRepository.findById(id);
    if (!resume) {
      throw new NotFoundException(`Currículo com ID '${id}' não foi encontrado.`);
    }
    return resume;
  }
}
