import { prisma } from '../lib/prisma';
import {
	CreateSimuladoInput,
	Simulado,
	UpdateSimuladoInput,
} from '../schemas/simulado.schema';

type PrismaSimulado = {
	id: string;
	name: string;
	difficulty: string | null;
	questionIds: string[];
	studentId: string;
	createdAt: Date;
	updatedAt: Date;
};

function toSimulado(simulado: PrismaSimulado): Simulado {
	return {
		...simulado,
		difficulty: simulado.difficulty ?? undefined,
	};
}

export class SimuladoRepository {
	async findAll(): Promise<Simulado[]> {
		const simulados = await prisma.mockExam.findMany();
		return simulados.map(toSimulado);
	}

	async findById(id: string): Promise<Simulado | null> {
		const simulado = await prisma.mockExam.findUnique({ where: { id } });
		return simulado ? toSimulado(simulado) : null;
	}

	async create(data: CreateSimuladoInput): Promise<Simulado> {
		const simulado = await prisma.mockExam.create({
			data: {
				studentId: data.studentId,
				name: data.name,
				difficulty: data.difficulty,
				questionIds: data.questionIds,
			},
		});
		return toSimulado(simulado);
	}

	async update(id: string, data: UpdateSimuladoInput): Promise<Simulado> {
		const simulado = await prisma.mockExam.update({
			where: { id },
			data: {
				name: data.name,
				difficulty: data.difficulty,
				questionIds: data.questionIds,
			},
		});
		return toSimulado(simulado);
	}

	async delete(id: string): Promise<Simulado> {
		const simulado = await prisma.mockExam.delete({ where: { id } });
		return toSimulado(simulado);
	}
}