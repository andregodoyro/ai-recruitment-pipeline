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
import { CreateTestUseCase } from '../../application/use-cases/create-test.use-case';
import { GetTestUseCase } from '../../application/use-cases/get-test.use-case';
import { ListTestsUseCase, ListTestsQueryDto } from '../../application/use-cases/list-tests.use-case';
import { UpdateTestUseCase } from '../../application/use-cases/update-test.use-case';
import { UpdateTestStatusUseCase } from '../../application/use-cases/update-test-status.use-case';
import { DeleteTestUseCase } from '../../application/use-cases/delete-test.use-case';
import { CreateQuestionUseCase } from '../../application/use-cases/create-question.use-case';
import { ListQuestionsUseCase } from '../../application/use-cases/list-questions.use-case';
import { UpdateQuestionUseCase } from '../../application/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from '../../application/use-cases/delete-question.use-case';
import { CreateTestDto } from '../../application/dtos/create-test.dto';
import { UpdateTestDto } from '../../application/dtos/update-test.dto';
import { UpdateTestStatusDto } from '../../application/dtos/update-test-status.dto';
import { CreateQuestionDto } from '../../application/dtos/create-question.dto';
import { UpdateQuestionDto } from '../../application/dtos/update-question.dto';

@ApiTags('tests')
@Controller('api/v1')
export class TestsController {
  constructor(
    private readonly createTestUseCase: CreateTestUseCase,
    private readonly getTestUseCase: GetTestUseCase,
    private readonly listTestsUseCase: ListTestsUseCase,
    private readonly updateTestUseCase: UpdateTestUseCase,
    private readonly updateTestStatusUseCase: UpdateTestStatusUseCase,
    private readonly deleteTestUseCase: DeleteTestUseCase,
    private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly listQuestionsUseCase: ListQuestionsUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
  ) {}

  @Post('tests')
  @ApiOperation({ summary: 'Criar um novo teste técnico' })
  @ApiResponse({ status: 201, description: 'Teste criado com sucesso' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  async create(@Body() dto: CreateTestDto) {
    return this.createTestUseCase.execute(dto);
  }

  @Get('tests')
  @ApiOperation({ summary: 'Listar testes técnicos com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista paginada de testes' })
  async findAll(@Query() query: ListTestsQueryDto) {
    return this.listTestsUseCase.execute(query);
  }

  @Get('jobs/:jobId/tests')
  @ApiOperation({ summary: 'Listar testes de uma vaga específica' })
  @ApiParam({ name: 'jobId', description: 'UUID da vaga' })
  @ApiResponse({ status: 200, description: 'Lista de testes da vaga' })
  async findByJob(@Param('jobId') jobId: string, @Query() query: ListTestsQueryDto) {
    return this.listTestsUseCase.execute({ ...query, jobId });
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Obter detalhes de um teste por ID' })
  @ApiParam({ name: 'id', description: 'UUID do teste' })
  @ApiResponse({ status: 200, description: 'Detalhes do teste' })
  @ApiResponse({ status: 404, description: 'Teste não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.getTestUseCase.execute(id);
  }

  @Patch('tests/:id')
  @ApiOperation({ summary: 'Atualizar dados de um teste' })
  @ApiParam({ name: 'id', description: 'UUID do teste' })
  @ApiResponse({ status: 200, description: 'Teste atualizado' })
  @ApiResponse({ status: 404, description: 'Teste não encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateTestDto) {
    return this.updateTestUseCase.execute(id, dto);
  }

  @Patch('tests/:id/status')
  @ApiOperation({ summary: 'Atualizar o status de um teste' })
  @ApiParam({ name: 'id', description: 'UUID do teste' })
  @ApiResponse({ status: 200, description: 'Status do teste atualizado' })
  @ApiResponse({ status: 404, description: 'Teste não encontrado' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateTestStatusDto) {
    return this.updateTestStatusUseCase.execute(id, dto.status);
  }

  @Delete('tests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um teste' })
  @ApiParam({ name: 'id', description: 'UUID do teste' })
  @ApiResponse({ status: 204, description: 'Teste excluído' })
  @ApiResponse({ status: 404, description: 'Teste não encontrado' })
  async remove(@Param('id') id: string) {
    await this.deleteTestUseCase.execute(id);
  }

  // --- QUESTION ENDPOINTS ---

  @Post('tests/:testId/questions')
  @ApiOperation({ summary: 'Adicionar uma questão ao teste' })
  @ApiParam({ name: 'testId', description: 'UUID do teste' })
  @ApiResponse({ status: 201, description: 'Questão criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados da questão inválidos' })
  @ApiResponse({ status: 404, description: 'Teste não encontrado' })
  async addQuestion(
    @Param('testId') testId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.createQuestionUseCase.execute(testId, dto);
  }

  @Get('tests/:testId/questions')
  @ApiOperation({ summary: 'Listar questões de um teste' })
  @ApiParam({ name: 'testId', description: 'UUID do teste' })
  @ApiResponse({ status: 200, description: 'Lista de questões' })
  @ApiResponse({ status: 404, description: 'Teste não encontrado' })
  async findQuestions(@Param('testId') testId: string) {
    return this.listQuestionsUseCase.execute(testId);
  }

  @Patch('questions/:id')
  @ApiOperation({ summary: 'Atualizar uma questão' })
  @ApiParam({ name: 'id', description: 'UUID da questão' })
  @ApiResponse({ status: 200, description: 'Questão atualizada' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.updateQuestionUseCase.execute(id, dto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma questão' })
  @ApiParam({ name: 'id', description: 'UUID da questão' })
  @ApiResponse({ status: 204, description: 'Questão removida' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async removeQuestion(@Param('id') id: string) {
    await this.deleteQuestionUseCase.execute(id);
  }
}
