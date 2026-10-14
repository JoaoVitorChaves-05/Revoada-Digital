import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

config({ path: '../../.env' });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: ['query', 'error', 'warn'],
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}