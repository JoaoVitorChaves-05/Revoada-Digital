import { prisma } from '../lib/prisma';
import { QuestionRepository } from '../repositories/question.repository';
import { uploadQuestionImageToSupabase } from './storage.service';
import { CreateQuestionInput, UpdateQuestionInput } from '../schemas/question.schema';

class QuestionService {
    private questionRepository: QuestionRepository;

    constructor() {
        this.questionRepository = new QuestionRepository();
    }

    async createQuestion(data: CreateQuestionInput, file?: Express.Multer.File) {
        let imageUrl: string | null = null;

        // 1. Se o usuário mandou uma imagem, faz o upload para o Supabase Storage
        if (file) {
            imageUrl = await uploadQuestionImageToSupabase(file);
        }

        // 2. Prepara os dados incluindo a URL da imagem e chama o repositório/prisma
        // (Se a sua equipe preferir salvar direto pelo repository, você pode passar o imageUrl para ele também)
        const questionData = {
            ...data,
            image: imageUrl, // Adiciona o link do Supabase
        };

        // Chama o repositório para salvar no banco
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