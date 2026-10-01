// Define valores fictícios ANTES de importar qualquer serviço que use o Supabase
process.env.SUPABASE_URL = 'https://mock-supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { questionService } from '../services/question.service';
import { prisma } from '../lib/prisma';
import * as storageService from '../services/storage.service';

// 1. Mockamos o Prisma para ele não bater num banco de dados real durante o teste
vi.mock('../lib/prisma', () => ({
    prisma: {
        question: {
            create: vi.fn(),
        },
    },
}));

// 2. Mockamos a função de upload do Supabase para retornar uma URL fictícia sem acessar a internet
vi.mock('../services/storage.service', () => ({
    uploadQuestionImageToSupabase: vi.fn(),
}));

describe('QuestionService - Criar Questão com Imagem', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve criar uma questão com sucesso enviando uma imagem', async () => {
        // Dados simulados da questão que viriam do front-end
        const questionInput = {
            text: 'Qual é a capital do Brasil?',
            difficulty: 1,
            alternatives: [
                { text: 'São Paulo', isCorrect: false },
                { text: 'Brasília', isCorrect: true },
            ],
        };

        // Simulação do arquivo que o Multer injeta em req.file
        const mockFile = {
            fieldname: 'image',
            originalname: 'teste-imagem.png',
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: Buffer.from('fake-image-bytes'),
            size: 1024,
        } as Express.Multer.File;

        // Definimos o que o mock do Supabase deve retornar quando chamado
        const fakeImageUrl = 'https://seu-projeto.supabase.co/storage/v1/object/public/questoes-imagens/questoes/teste-123.png';
        vi.spyOn(storageService, 'uploadQuestionImageToSupabase').mockResolvedValueOnce(fakeImageUrl);

        // Definimos o que o Prisma.create deve retornar quando salvar no banco simulado
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

        // Executamos a função do service
        const result = await questionService.createQuestion(questionInput, mockFile);

        // Validações (Asserts)
        // 1. Verifica se chamou a função de upload do Supabase passando o arquivo correto
        expect(storageService.uploadQuestionImageToSupabase).toHaveBeenCalledTimes(1);
        expect(storageService.uploadQuestionImageToSupabase).toHaveBeenCalledWith(mockFile);

        // 2. Verifica se salvou no Prisma com o imageUrl preenchido corretamente
        expect(prisma.question.create).toHaveBeenCalledTimes(1);
        expect(prisma.question.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    imageUrl: fakeImageUrl,
                    text: questionInput.text,
                }),
            })
        );

        // 3. Garante que o retorno da função é o esperada
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
            imageUrl: null, // Sem imagem
            alternatives: [],
        };

        vi.mocked(prisma.question.create).mockResolvedValueOnce(fakeCreatedQuestionWithoutImage as any);

        // Chamamos o service sem passar o segundo parâmetro (arquivo)
        const result = await questionService.createQuestion(questionInput, undefined);

        // Garante que o Supabase NÃO foi chamado
        expect(storageService.uploadQuestionImageToSupabase).not.toHaveBeenCalled();

        // Garante que salvou no Prisma com o imageUrl como null/undefined
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