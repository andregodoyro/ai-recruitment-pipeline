import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EvaluateResumeUseCase } from '../../application/use-cases/evaluate-resume.use-case';
import { GetEvaluationUseCase } from '../../application/use-cases/get-evaluation.use-case';
import { ListJobEvaluationsUseCase } from '../../application/use-cases/list-job-evaluations.use-case';
import { ListCandidateEvaluationsUseCase } from '../../application/use-cases/list-candidate-evaluations.use-case';
import { EvaluateResumeDto } from '../../application/dtos/evaluate-resume.dto';

@ApiTags('screening')
@Controller('api/v1')
export class ScreeningController {
  constructor(
    private readonly evaluateResumeUseCase: EvaluateResumeUseCase,
    private readonly getEvaluationUseCase: GetEvaluationUseCase,
    private readonly listJobEvaluationsUseCase: ListJobEvaluationsUseCase,
    private readonly listCandidateEvaluationsUseCase: ListCandidateEvaluationsUseCase,
  ) {}

  @Post('screening/evaluate')
  @ApiOperation({ summary: 'Executar triagem automatizada de currículo por IA' })
  @ApiResponse({ status: 201, description: 'Avaliação da IA concluída e salva com sucesso' })
  @ApiResponse({ status: 400, description: 'Currículo sem texto extraído ou dados inválidos' })
  @ApiResponse({ status: 404, description: 'Candidato ou vaga não encontrada' })
  async evaluate(@Body() dto: EvaluateResumeDto) {
    return this.evaluateResumeUseCase.execute(dto);
  }

  @Get('screening/evaluations/:id')
  @ApiOperation({ summary: 'Obter detalhes de uma avaliação de IA por ID' })
  @ApiParam({ name: 'id', description: 'UUID da avaliação' })
  @ApiResponse({ status: 200, description: 'Detalhes da avaliação' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.getEvaluationUseCase.execute(id);
  }

  @Get('jobs/:jobId/evaluations')
  @ApiOperation({ summary: 'Listar todas as avaliações de triagem de uma vaga (ordenadas por score final)' })
  @ApiParam({ name: 'jobId', description: 'UUID da vaga' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações da vaga' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  async findByJob(@Param('jobId') jobId: string) {
    return this.listJobEvaluationsUseCase.execute(jobId);
  }

  @Get('candidates/:candidateId/evaluations')
  @ApiOperation({ summary: 'Listar todas as avaliações de triagem de um candidato' })
  @ApiParam({ name: 'candidateId', description: 'UUID do candidato' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações do candidato' })
  @ApiResponse({ status: 404, description: 'Candidato não encontrado' })
  async findByCandidate(@Param('candidateId') candidateId: string) {
    return this.listCandidateEvaluationsUseCase.execute(candidateId);
  }
}
