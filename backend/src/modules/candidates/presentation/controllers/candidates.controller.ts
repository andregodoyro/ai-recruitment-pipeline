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
import { CreateCandidateUseCase } from '../../application/use-cases/create-candidate.use-case';
import { GetCandidateUseCase } from '../../application/use-cases/get-candidate.use-case';
import { ListCandidatesUseCase } from '../../application/use-cases/list-candidates.use-case';
import { UpdateCandidateUseCase } from '../../application/use-cases/update-candidate.use-case';
import { DeleteCandidateUseCase } from '../../application/use-cases/delete-candidate.use-case';
import { CreateCandidateDto } from '../../application/dtos/create-candidate.dto';
import { UpdateCandidateDto } from '../../application/dtos/update-candidate.dto';
import { ListCandidatesQueryDto } from '../../application/dtos/list-candidates-query.dto';

@ApiTags('candidates')
@Controller('api/v1/candidates')
export class CandidatesController {
  constructor(
    private readonly createCandidateUseCase: CreateCandidateUseCase,
    private readonly getCandidateUseCase: GetCandidateUseCase,
    private readonly listCandidatesUseCase: ListCandidatesUseCase,
    private readonly updateCandidateUseCase: UpdateCandidateUseCase,
    private readonly deleteCandidateUseCase: DeleteCandidateUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo candidato' })
  @ApiResponse({ status: 201, description: 'Candidato cadastrado com sucesso' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  async create(@Body() dto: CreateCandidateDto) {
    return this.createCandidateUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar candidatos com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista paginada de candidatos' })
  async findAll(@Query() query: ListCandidatesQueryDto) {
    return this.listCandidatesUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um candidato por ID' })
  @ApiParam({ name: 'id', description: 'UUID do candidato' })
  @ApiResponse({ status: 200, description: 'Detalhes do candidato' })
  @ApiResponse({ status: 404, description: 'Candidato não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.getCandidateUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de um candidato' })
  @ApiParam({ name: 'id', description: 'UUID do candidato' })
  @ApiResponse({ status: 200, description: 'Candidato atualizado' })
  @ApiResponse({ status: 404, description: 'Candidato não encontrado' })
  @ApiResponse({ status: 409, description: 'E-mail já está em uso' })
  async update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.updateCandidateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover (soft-delete) um candidato' })
  @ApiParam({ name: 'id', description: 'UUID do candidato' })
  @ApiResponse({ status: 204, description: 'Candidato removido' })
  @ApiResponse({ status: 404, description: 'Candidato não encontrado' })
  async remove(@Param('id') id: string) {
    await this.deleteCandidateUseCase.execute(id);
  }
}
