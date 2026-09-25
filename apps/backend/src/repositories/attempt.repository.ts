import { prisma } from '../lib/prisma';
import { CreateAttemptInput, UpdateAttemptInput } from '../schemas/attempt.schema';

export class AttemptRepository {
    async create(data: CreateAttemptInput) {
        return prisma.attempt.create({ data });
    }

    async findById(id: string) {
        return prisma.attempt.findUnique({ where: { id } });
    }

    async update(id: string, data: UpdateAttemptInput) {
        return prisma.attempt.update({ where: { id }, data });
    }

    async delete(id: string) {
        return prisma.attempt.delete({ where: { id } });
    }
}