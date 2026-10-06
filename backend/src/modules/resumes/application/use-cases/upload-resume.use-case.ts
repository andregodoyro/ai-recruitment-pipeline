import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Resume, CandidateStatus } from '@prisma/client';
import {
  IResumesRepository,
  RESUMES_REPOSITORY,
} from '../../domain/resumes.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../../jobs/domain/jobs.repository.interface';
import {
  ITextExtractor,
  TEXT_EXTRACTOR,
} from '../../domain/services/text-extractor.interface';

export interface UploadResumeFileParam {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  path?: string;
}

@Injectable()
export class UploadResumeUseCase {
  constructor(
    @Inject(RESUMES_REPOSITORY)
    private readonly resumesRepository: IResumesRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
    @Inject(TEXT_EXTRACTOR)
    private readonly textExtractor: ITextExtractor,
  ) {}

  async execute(
    candidateId: string,
    jobId: string,
    file: UploadResumeFileParam,
  ): Promise<Resume> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Arquivo de currículo não foi fornecido.');
    }

    // Validação de tipos de arquivo suportados (apenas PDF e TXT)
    const allowedMimeTypes = ['application/pdf', 'text/plain'];
    const allowedExtensions = ['.pdf', '.txt'];
    const fileExt = file.originalname ? file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase() : '';

    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(fileExt)) {
      throw new BadRequestException(
        'Tipo de arquivo não permitido. Apenas arquivos PDF e TXT (.pdf, .txt) são aceitos.',
      );
    }

    // Validação de tamanho máximo (5 MB por padrão)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `O arquivo excede o limite máximo permitido de 5 MB. Tamanho recebido: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
      );
    }

    const candidate = await this.candidatesRepository.findById(candidateId);
    if (!candidate) {
      throw new NotFoundException(`Candidato com ID '${candidateId}' não foi encontrado.`);
    }

    const job = await this.jobsRepository.findById(jobId);
    if (!job) {
      throw new NotFoundException(`Vaga com ID '${jobId}' não foi encontrada.`);
    }

    // Desativa currículos anteriores desta vaga
    await this.resumesRepository.deactivatePreviousResumes(candidateId, jobId);

    // Extrai o texto do PDF / arquivo
    const extractedText = await this.textExtractor.extractText(
      file.buffer,
      file.mimetype,
    );

    const fileUrl = file.path ?? `/uploads/${Date.now()}-${file.originalname}`;

    const resume = await this.resumesRepository.create({
      candidateId,
      jobId,
      fileName: file.originalname,
      fileUrl,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      extractedText,
      isActive: true,
    });

    // Atualiza status do candidato para SCREENING se for NEW
    if (candidate.status === CandidateStatus.NEW) {
      await this.candidatesRepository.updateStatus(
        candidateId,
        CandidateStatus.SCREENING,
      );
    }

    return resume;
  }
}
