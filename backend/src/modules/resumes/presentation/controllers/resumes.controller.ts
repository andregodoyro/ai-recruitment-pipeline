import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UploadResumeUseCase } from '../../application/use-cases/upload-resume.use-case';
import { GetResumeUseCase } from '../../application/use-cases/get-resume.use-case';
import { ListCandidateResumesUseCase } from '../../application/use-cases/list-candidate-resumes.use-case';
import { UploadResumeDto } from '../../application/dtos/upload-resume.dto';

@ApiTags('resumes')
@Controller('api/v1')
export class ResumesController {
  constructor(
    private readonly uploadResumeUseCase: UploadResumeUseCase,
    private readonly getResumeUseCase: GetResumeUseCase,
    private readonly listCandidateResumesUseCase: ListCandidateResumesUseCase,
  ) {}

  @Post('candidates/:candidateId/resumes')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Fazer upload do currículo de um candidato' })
  @ApiParam({ name: 'candidateId', description: 'UUID do candidato' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', format: 'uuid', description: 'UUID da vaga associada' },
        file: { type: 'string', format: 'binary', description: 'Arquivo PDF ou TXT do currículo' },
      },
      required: ['jobId', 'file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Currículo enviado e texto extraído com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo não enviado ou inválido' })
  @ApiResponse({ status: 404, description: 'Candidato ou vaga não encontrada' })
  async uploadResume(
    @Param('candidateId') candidateId: string,
    @Body('jobId') jobId: string,
    @UploadedFile() file?: any,
  ) {
    if (!jobId) {
      throw new BadRequestException('O campo jobId é obrigatório.');
    }
    if (!file) {
      throw new BadRequestException('O arquivo de currículo é obrigatório.');
    }

    return this.uploadResumeUseCase.execute(candidateId, jobId, file);
  }

  @Get('resumes/:id')
  @ApiOperation({ summary: 'Obter detalhes e texto extraído de um currículo' })
  @ApiParam({ name: 'id', description: 'UUID do currículo' })
  @ApiResponse({ status: 200, description: 'Detalhes do currículo' })
  @ApiResponse({ status: 404, description: 'Currículo não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.getResumeUseCase.execute(id);
  }

  @Get('candidates/:candidateId/resumes')
  @ApiOperation({ summary: 'Listar todos os currículos enviados por um candidato' })
  @ApiParam({ name: 'candidateId', description: 'UUID do candidato' })
  @ApiResponse({ status: 200, description: 'Lista de currículos do candidato' })
  @ApiResponse({ status: 404, description: 'Candidato não encontrado' })
  async findByCandidate(@Param('candidateId') candidateId: string) {
    return this.listCandidateResumesUseCase.execute(candidateId);
  }
}
