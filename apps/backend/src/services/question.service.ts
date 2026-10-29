import { prisma } from '../lib/prisma';
import { QuestionRepository } from '../repositories/question.repository';
import { uploadQuestionImageToSupabase } from './storage.service';
import { CreateQuestionInput, UpdateQuestionInput } from '../schemas/question.schema';

export class QuestionService { 
    private questionRepository: QuestionRepository;

    constructor(questionRepository?: QuestionRepository) {
        this.questionRepository = questionRepository || new QuestionRepository();
    }

    async createQuestion(data: CreateQuestionInput, file?: Express.Multer.File) {
        let imageUrl: string | null = null;

        if (file) {
            imageUrl = await uploadQuestionImageToSupabase(file);
        }

        const questionData = {
            ...data,
            imageUrl: imageUrl, // 'image' para 'imageUrl'
        };

        return this.questionRepository.create(questionData);
    }

    async listQuestions(page: number, limit: number, difficulty?: number) {
        const skip = (page - 1) * limit;
        return this.questionRepository.findAll(skip, limit, difficulty);
    }

    async readQuestion(id: string) {
        const question = await this.questionRepository.findById(id);
        if (!question) {
            throw new Error('Questão não encontrada');
        }
        return question;
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