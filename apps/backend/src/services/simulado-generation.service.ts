import { SimuladoGenerationRepository } from '../repositories/simulado-generation.repository';
import { GenerateSimuladoInput } from '../schemas/simulado-generate.schema';

const QUESTIONS_PER_SIMULADO = 8;

export class SimuladoGenerationService {
    constructor(
        private readonly generationRepository = new SimuladoGenerationRepository(),
    ) { }

    async generate(data: GenerateSimuladoInput) {
        const questionIds = await this.generationRepository.findRandomQuestionIds(
            data.subject,
            data.concept,
            QUESTIONS_PER_SIMULADO,
        );

        if (questionIds.length < QUESTIONS_PER_SIMULADO) {
            throw new Error('Questões insuficientes para gerar o simulado');
        }

        const name = `${data.subject} - ${data.concept}`;
        return this.generationRepository.createWithQuestions(
            data.studentId,
            name,
            questionIds,
        );
    }
}

export const simuladoGenerationService = new SimuladoGenerationService();