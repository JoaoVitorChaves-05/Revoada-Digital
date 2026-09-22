import { QuestionRepository } from '../repositories/question.repository';
import { UpdateQuestionInput } from '../schemas/question.schema';

export class QuestionService {
    constructor(private readonly questionRepository = new QuestionRepository()) {}

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