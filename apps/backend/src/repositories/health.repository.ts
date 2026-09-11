import { prisma } from '../lib/prisma';

export class HealthRepository {
	checkConnection() {
		return prisma.$queryRaw`SELECT 1`;
	}
}