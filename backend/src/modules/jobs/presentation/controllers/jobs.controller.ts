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
import { CreateJobUseCase } from '../../application/use-cases/create-job.use-case';
import { GetJobUseCase } from '../../application/use-cases/get-job.use-case';
import { ListJobsUseCase } from '../../application/use-cases/list-jobs.use-case';
import { UpdateJobUseCase } from '../../application/use-cases/update-job.use-case';
import { UpdateJobStatusUseCase } from '../../application/use-cases/update-job-status.use-case';
import { DeleteJobUseCase } from '../../application/use-cases/delete-job.use-case';
import { CreateJobDto } from '../../application/dtos/create-job.dto';
import { UpdateJobDto } from '../../application/dtos/update-job.dto';
import { UpdateJobStatusDto } from '../../application/dtos/update-job-status.dto';
import { ListJobsQueryDto } from '../../application/dtos/list-jobs-query.dto';

@ApiTags('jobs')
@Controller('api/v1/jobs')
export class JobsController {
  constructor(
    private readonly createJobUseCase: CreateJobUseCase,
    private readonly getJobUseCase: GetJobUseCase,
    private readonly listJobsUseCase: ListJobsUseCase,
    private readonly updateJobUseCase: UpdateJobUseCase,
    private readonly updateJobStatusUseCase: UpdateJobStatusUseCase,
    private readonly deleteJobUseCase: DeleteJobUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova vaga seletiva' })
  @ApiResponse({ status: 201, description: 'Vaga criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos ou pesos não somam 100%' })
  async create(@Body() dto: CreateJobDto) {
    return this.createJobUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vagas com paginao e filtros' })
  @ApiResponse({ status: 200, description: 'Lista paginada de vagas' })
  async findAll(@Query() query: ListJobsQueryDto) {
    return this.listJobsUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma vaga por ID' })
  @ApiParam({ name: 'id', description: 'UUID da vaga' })
  @ApiResponse({ status: 200, description: 'Detalhes da vaga' })
  @ApiResponse({ status: 404, description: 'Vaga no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.getJobUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma vaga' })
  @ApiParam({ name: 'id', description: 'UUID da vaga' })
  @ApiResponse({ status: 200, description: 'Vaga atualizada' })
  @ApiResponse({ status: 404, description: 'Vaga no encontrada' })
  async update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.updateJobUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar o status de uma vaga' })
  @ApiParam({ name: 'id', description: 'UUID da vaga' })
  @ApiResponse({ status: 200, description: 'Status da vaga atualizado' })
  @ApiResponse({ status: 404, description: 'Vaga no encontrada' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateJobStatusDto,
  ) {
    return this.updateJobStatusUseCase.execute(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover (soft-delete) uma vaga' })
  @ApiParam({ name: 'id', description: 'UUID da vaga' })
  @ApiResponse({ status: 204, description: 'Vaga removida' })
  @ApiResponse({ status: 404, description: 'Vaga no encontrada' })
  async remove(@Param('id') id: string) {
    await this.deleteJobUseCase.execute(id);
  }
}
