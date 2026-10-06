import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CandidateStatus, Interview, JobStatus } from '@prisma/client';
import {
  IInterviewsRepository,
  INTERVIEWS_REPOSITORY,
} from '../../domain/interviews.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../../jobs/domain/jobs.repository.interface';
import { CreateInterviewDto } from '../dtos/create-interview.dto';

@Injectable()
export class CreateInterviewUseCase {
  constructor(
    @Inject(INTERVIEWS_REPOSITORY)
    private readonly interviewsRepository: IInterviewsRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(dto: CreateInterviewDto): Promise<Interview> {
    const candidate = await this.candidatesRepository.findById(dto.candidateId);
    if (!candidate) {
      throw new NotFoundException(`Candidato com ID '${dto.candidateId}' não foi encontrado.`);
    }

    const job = await this.jobsRepository.findById(dto.jobId);
    if (!job) {
      throw new NotFoundException(`Vaga com ID '${dto.jobId}' não foi encontrada.`);
    }

    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('Não é possível agendar entrevistas para uma vaga que não esteja aberta.');
    }

    // Regra de Negócio: Entrevistas só podem ser criadas após TEST_APPROVED (ou candidato já em INTERVIEW)
    if (
      candidate.status !== CandidateStatus.TEST_APPROVED &&
      candidate.status !== CandidateStatus.INTERVIEW
    ) {
      throw new BadRequestException(
        `Entrevistas só podem ser agendadas para candidatos com status 'TEST_APPROVED'. Status atual: '${candidate.status}'.`,
      );
    }

    const scheduledDate = new Date(dto.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Formato de data inválido para scheduledAt.');
    }

    const interview = await this.interviewsRepository.create({
      candidateId: dto.candidateId,
      jobId: dto.jobId,
      scheduledAt: scheduledDate,
      meetingUrl: dto.meetingUrl,
      notes: dto.notes,
    });

    // Atualiza status do candidato para INTERVIEW
    await this.candidatesRepository.updateStatus(candidate.id, CandidateStatus.INTERVIEW);

    return interview;
  }
}
