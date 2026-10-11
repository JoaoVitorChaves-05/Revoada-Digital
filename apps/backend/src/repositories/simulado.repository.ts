import { prisma } from '../lib/prisma';
import {
	CreateSimuladoInput,
	Simulado,
	UpdateSimuladoInput,
} from '../schemas/simulado.schema';

type PrismaSimuladoWithQuestions = {
	id: string;
	name: string;
	studentId: string;
	questions: { questionId: string }[];
	createdAt: Date;
	updatedAt: Date;
};

function toSimulado(simulado: PrismaSimuladoWithQuestions): Simulado {
	return {
		id: simulado.id,
		name: simulado.name,
		studentId: simulado.studentId,
		questionIds: simulado.questions.map((q) => q.questionId),
		createdAt: simulado.createdAt,
		updatedAt: simulado.updatedAt,
	};
}

export class SimuladoRepository {
	async findAll(): Promise<Simulado[]> {
		const simulados = await prisma.mockExam.findMany({
			include: { questions: true },
		});
		return simulados.map(toSimulado);
	}

	async findById(id: string): Promise<Simulado | null> {
		const simulado = await prisma.mockExam.findUnique({
			where: { id },
			include: { questions: true },
		});
		return simulado ? toSimulado(simulado) : null;
	}

	async create(data: CreateSimuladoInput): Promise<Simulado> {
		const simulado = await prisma.mockExam.create({
			data: {
				studentId: data.studentId,
				name: data.name,
				questions: {
					create: data.questionIds.map((questionId, index) => ({
						questionId,
						position: index + 1,
					})),
				},
			},
			include: { questions: true },
		});
		return toSimulado(simulado);
	}

	async update(id: string, data: UpdateSimuladoInput): Promise<Simulado> {
		const simulado = await prisma.mockExam.update({
			where: { id },
			data: {
				name: data.name,
				...(data.questionIds && {
					questions: {
						deleteMany: {},               // apaga todos os MockExamQuestion desse simulado
						create: data.questionIds.map((questionId, index) => ({
							questionId,
							position: index + 1,
						})),
					},
				}),
			},
			include: { questions: true },
		});
		return toSimulado(simulado);
	}

	async delete(id: string): Promise<Simulado> {
		const simulado = await prisma.mockExam.delete({
			where: { id },
			include: { questions: true },
		});
		return toSimulado(simulado);
	}
}