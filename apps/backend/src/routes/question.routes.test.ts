import express, { Request, Response } from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { questionRoutes } from './question.routes';

// Substitui os controllers neste teste para não acessar o banco.
vi.mock('../controllers/question.controller', () => {
const unusedRoute = (_req: Request, res: Response) => res.sendStatus(200);

return {
createQuestion: (req: Request, res: Response) =>
res.status(201).json({
data: req.body,
imageName: req.file?.originalname ?? null,
}),
listQuestions: unusedRoute,
readQuestion: unusedRoute,
updateQuestion: unusedRoute,
deleteQuestion: unusedRoute,
};
});

function createTestApp() {
const app = express();
app.use(express.json());
app.use('/questions', questionRoutes);
return app;
}

const alternatives = [
{ text: '2', isCorrect: true },
{ text: '3', isCorrect: false },
];

describe('POST /questions', () => {
it('aceita JSON sem imagem', async () => {
const response = await request(createTestApp())
.post('/questions')
.send({
text: 'Quanto é 1 + 1?',
subject: ['Matemática'],
concept: ['Adição'],
difficulty: 1,
alternatives,
});

expect(response.status).toBe(201);
expect(response.body.imageName).toBeNull();
});

it('aceita formulário sem imagem e normaliza matéria/conceito para lista', async () => {
const response = await request(createTestApp())
.post('/questions')
.field('text', 'Quanto é 1 + 1?')
.field('subject', 'Matemática')
.field('concept', 'Adição')
.field('difficulty', '1')
.field('alternatives', JSON.stringify(alternatives));

expect(response.status).toBe(201);
expect(response.body.imageName).toBeNull();
expect(response.body.data.difficulty).toBe(1);
// valor único no multipart vira array de um item
expect(response.body.data.subject).toEqual(['Matemática']);
expect(response.body.data.concept).toEqual(['Adição']);
});

it('aceita matéria/conceito como JSON array no multipart', async () => {
const response = await request(createTestApp())
.post('/questions')
.field('text', 'Questão interdisciplinar')
.field('subject', JSON.stringify(['Matemática', 'Física']))
.field('concept', JSON.stringify(['Função Afim', 'Cinemática']))
.field('difficulty', '2')
.field('alternatives', JSON.stringify(alternatives));

expect(response.status).toBe(201);
expect(response.body.data.subject).toEqual(['Matemática', 'Física']);
expect(response.body.data.concept).toEqual(['Função Afim', 'Cinemática']);
});

it('recebe imagem e converte os demais campos', async () => {
const response = await request(createTestApp())
.post('/questions')
.field('text', 'Observe a figura')
.field('subject', 'Matemática')
.field('concept', 'Adição')
.field('difficulty', '2')
.field('alternatives', JSON.stringify(alternatives))
.attach('image', Buffer.from('arquivo para testar o recebimento'), 'figura.png');

expect(response.status).toBe(201);
expect(response.body.imageName).toBe('figura.png');
expect(response.body.data.difficulty).toBe(2);
expect(response.body.data.alternatives).toEqual(alternatives);
});
});
