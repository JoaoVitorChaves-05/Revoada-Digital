import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma';

// Mockar o Prisma
vi.mock('../lib/prisma', () => ({
    prisma: {
        question: {
            create: vi.fn(),
        },
    },
}));

// Mockar o storage.service INTEIRO ANTES de ele ser importado.
vi.mock('../services/storage.service', () => ({
    uploadQuestionImageToSupabase: vi.fn(),
}));


import { questionService } from './question.service';
import * as storageService from '../services/storage.service';

describe('QuestionService - Criar Questão com Imagem', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve criar uma questão com sucesso enviando uma imagem', async () => {
        const questionInput = {
            text: 'Qual é a capital do Brasil?',
            difficulty: 1,
            alternatives: [
                { text: 'São Paulo', isCorrect: false },
                { text: 'Brasília', isCorrect: true },
            ],
        };

        const mockFile = {
            fieldname: 'image',
            originalname: 'teste-imagem.png',
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: Buffer.from('fake-image-bytes'),
            size: 1024,
        } as Express.Multer.File;

        const fakeImageUrl = 'https://seu-projeto.supabase.co/storage/v1/object/public/questoes-imagens/questoes/teste-123.png';
        
        //retornar a URL fake
        vi.mocked(storageService.uploadQuestionImageToSupabase).mockResolvedValueOnce(fakeImageUrl);

        const fakeCreatedQuestion = {
            id: 'uuid-123',
            text: questionInput.text,
            difficulty: questionInput.difficulty,
            imageUrl: fakeImageUrl,
            alternatives: [
                { id: 'alt-1', text: 'São Paulo', isCorrect: false, questionId: 'uuid-123' },
                { id: 'alt-2', text: 'Brasília', isCorrect: true, questionId: 'uuid-123' },
            ],
        };

        vi.mocked(prisma.question.create).mockResolvedValueOnce(fakeCreatedQuestion as any);

        const result = await questionService.createQuestion(questionInput, mockFile);

        expect(storageService.uploadQuestionImageToSupabase).toHaveBeenCalledTimes(1);
        expect(storageService.uploadQuestionImageToSupabase).toHaveBeenCalledWith(mockFile);

        expect(prisma.question.create).toHaveBeenCalledTimes(1);
        expect(prisma.question.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    imageUrl: fakeImageUrl,
                    text: questionInput.text,
                }),
            })
        );

        expect(result).toEqual(fakeCreatedQuestion);
    });

    it('deve criar uma questão com sucesso mesmo se NENHUMA imagem for enviada', async () => {
        const questionInput = {
            text: 'Quanto é 2 + 2?',
            difficulty: 1,
            alternatives: [
                { text: '3', isCorrect: false },
                { text: '4', isCorrect: true },
            ],
        };

        const fakeCreatedQuestionWithoutImage = {
            id: 'uuid-456',
            text: questionInput.text,
            difficulty: questionInput.difficulty,
            imageUrl: null,
            alternatives: [],
        };

        vi.mocked(prisma.question.create).mockResolvedValueOnce(fakeCreatedQuestionWithoutImage as any);

        const result = await questionService.createQuestion(questionInput, undefined);

        expect(storageService.uploadQuestionImageToSupabase).not.toHaveBeenCalled();

        expect(prisma.question.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    imageUrl: null,
                }),
            })
        );

        expect(result.imageUrl).toBeNull();
    });
});