import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

config({ path: '../../.env' });

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: ['query', 'error', 'warn'],
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
