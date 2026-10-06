import { Question, QuestionType } from '@prisma/client';

export interface CreateQuestionInput {
  testId: string;
  questionText: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  weight?: number;
  order?: number;
}

export interface UpdateQuestionInput {
  questionText?: string;
  type?: QuestionType;
  options?: string[];
  correctAnswer?: string;
  weight?: number;
  order?: number;
}

export const QUESTIONS_REPOSITORY = 'QUESTIONS_REPOSITORY';

export interface IQuestionsRepository {
  create(data: CreateQuestionInput): Promise<Question>;
  findById(id: string): Promise<Question | null>;
  findByTestId(testId: string): Promise<Question[]>;
  update(id: string, data: UpdateQuestionInput): Promise<Question>;
  delete(id: string): Promise<void>;
}
