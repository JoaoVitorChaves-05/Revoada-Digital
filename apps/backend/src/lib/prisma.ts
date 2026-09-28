import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: '../../.env' });

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ['query', 'error', 'warn'],
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
