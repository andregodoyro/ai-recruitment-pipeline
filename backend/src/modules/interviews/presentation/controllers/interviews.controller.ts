import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateInterviewUseCase } from '../../application/use-cases/create-interview.use-case';
import { GetInterviewUseCase } from '../../application/use-cases/get-interview.use-case';
import { ListInterviewsUseCase } from '../../application/use-cases/list-interviews.use-case';
import { UpdateInterviewUseCase } from '../../application/use-cases/update-interview.use-case';
import { DeleteInterviewUseCase } from '../../application/use-cases/delete-interview.use-case';
import { CreateInterviewDto } from '../../application/dtos/create-interview.dto';
import { UpdateInterviewDto } from '../../application/dtos/update-interview.dto';
import { ListInterviewsQueryDto } from '../../application/dtos/list-interviews-query.dto';

@ApiTags('interviews')
@Controller('api/v1')
export class InterviewsController {
  constructor(
    private readonly createInterviewUseCase: CreateInterviewUseCase,
    private readonly getInterviewUseCase: GetInterviewUseCase,
    private readonly listInterviewsUseCase: ListInterviewsUseCase,
    private readonly updateInterviewUseCase: UpdateInterviewUseCase,
    private readonly deleteInterviewUseCase: DeleteInterviewUseCase,
  ) {}

  @Post('interviews')
  @ApiOperation({ summary: 'Agendar uma nova entrevista para candidato TEST_APPROVED' })
  @ApiResponse({ status: 201, description: 'Entrevista agendada com sucesso' })
  @ApiResponse({ status: 400, description: 'Candidato não está no status TEST_APPROVED ou dados inválidos' })
  @ApiResponse({ status: 404, description: 'Candidato ou vaga não encontrada' })
  async create(@Body() dto: CreateInterviewDto) {
    return this.createInterviewUseCase.execute(dto);
  }

  @Get('interviews')
  @ApiOperation({ summary: 'Listar entrevistas com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista paginada de entrevistas' })
  async findAll(@Query() query: ListInterviewsQueryDto) {
    return this.listInterviewsUseCase.execute(query);
  }

  @Get('interviews/:id')
  @ApiOperation({ summary: 'Obter detalhes de uma entrevista por ID' })
  @ApiParam({ name: 'id', description: 'UUID da entrevista' })
  @ApiResponse({ status: 200, description: 'Detalhes da entrevista' })
  @ApiResponse({ status: 404, description: 'Entrevista não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.getInterviewUseCase.execute(id);
  }

  @Get('jobs/:jobId/interviews')
  @ApiOperation({ summary: 'Listar todas as entrevistas agendadas para uma vaga' })
  @ApiParam({ name: 'jobId', description: 'UUID da vaga' })
  @ApiResponse({ status: 200, description: 'Lista de entrevistas da vaga' })
  async findByJob(@Param('jobId') jobId: string) {
    return this.listInterviewsUseCase.execute({ jobId });
  }

  @Get('candidates/:candidateId/interviews')
  @ApiOperation({ summary: 'Listar todas as entrevistas de um candidato' })
  @ApiParam({ name: 'candidateId', description: 'UUID do candidato' })
  @ApiResponse({ status: 200, description: 'Lista de entrevistas do candidato' })
  async findByCandidate(@Param('candidateId') candidateId: string) {
    return this.listInterviewsUseCase.execute({ candidateId });
  }

  @Patch('interviews/:id')
  @ApiOperation({ summary: 'Atualizar dados de uma entrevista (horário, link, notas, status)' })
  @ApiParam({ name: 'id', description: 'UUID da entrevista' })
  @ApiResponse({ status: 200, description: 'Entrevista atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Entrevista não encontrada' })
  async update(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return this.updateInterviewUseCase.execute(id, dto);
  }

  @Delete('interviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar/excluir uma entrevista' })
  @ApiParam({ name: 'id', description: 'UUID da entrevista' })
  @ApiResponse({ status: 204, description: 'Entrevista removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Entrevista não encontrada' })
  async remove(@Param('id') id: string) {
    await this.deleteInterviewUseCase.execute(id);
  }
}
