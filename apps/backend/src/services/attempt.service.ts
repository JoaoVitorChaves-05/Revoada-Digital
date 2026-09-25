import { CreateAttemptInput, UpdateAttemptInput } from '../schemas/attempt.schema';
import { AttemptRepository } from '../repositories/attempt.repository';

export class AttemptService {

    constructor(private readonly attemptRepository = new AttemptRepository()) {}

    async createAttempt(data: CreateAttemptInput) {
        return this.attemptRepository.create(data);
    }

    async readAttempt(id: string) {
        const attempt = await this.attemptRepository.findById(id);
        if (!attempt) {
            throw new Error('Tentativa nao encontrada');
        }

        return attempt;
    }

    async updateAttempt(id: string, data: UpdateAttemptInput) {
        const attempt = await this.attemptRepository.findById(id);
        if (!attempt) {
            throw new Error('Tentativa nao encontrada');
        }

        return this.attemptRepository.update(id, data);
    }

    async deleteAttempt(id: string) {
        const attempt = await this.attemptRepository.findById(id);
        if (!attempt) {
            throw new Error('Tentativa nao encontrada');
        }

        return this.attemptRepository.delete(id);
    }
}

export const attemptService = new AttemptService();