import { QuestionRepository } from '../repositories/question.repository';

export class QuestionService {
  constructor(private questionRepo: QuestionRepository) {}

  async createQuestion(data: any) {
    return await this.questionRepo.create(data);
  }

  async listQuestions(page: number, limit: number, difficulty?: string) {
    const skip = (page - 1) * limit;
    const whereClause = difficulty ? { dificuldade: difficulty } : {};
    
    return await this.questionRepo.findAll(skip, limit, whereClause);
  }

  async getQuestionById(id: number) {
    return await this.questionRepo.findById(id);
  }
}