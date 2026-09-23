import { QuestionRepository } from '../repositories/question.repository';
import { CreateQuestionInput, UpdateQuestionInput } from '../schemas/question.schema';

export class QuestionService {
    constructor(private readonly questionRepository = new QuestionRepository()) {}

    async createQuestion(data: CreateQuestionInput) {
        return this.questionRepository.create(data);
    }

    async listQuestions(page: number, limit: number, difficulty?: number) {
        const skip = (page - 1) * limit;
        return this.questionRepository.findAll(skip, limit, difficulty);
    }

    async getQuestionById(id: string) {
        return this.questionRepository.findById(id);
    }
    async updateQuestion(id: string, data: UpdateQuestionInput) {
        const question = await this.questionRepository.findById(id);
        if (!question) {
            throw new Error('Questão não encontrada');
        }

        return this.questionRepository.update(id, data);
    }

    async deleteQuestion(id: string) {
        const question = await this.questionRepository.findById(id);
        if (!question) {
            throw new Error('Questão não encontrada');
        }

        return this.questionRepository.delete(id);
    }
}

export const questionService = new QuestionService();
