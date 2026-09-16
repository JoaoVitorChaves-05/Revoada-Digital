import { randomUUID } from 'node:crypto';
import {
	CreateSimuladoInput,
	Simulado,
	UpdateSimuladoInput,
} from '../schemas/simulado.schema';

/*
 * Prévia da futura implementação com Prisma.
 * O código abaixo é apenas uma referência: atualmente este repositório usa memória.
 *
 * findById:
 *   return prisma.simulado.findUnique({ where: { id } });
 *
 * create:
 *   return prisma.simulado.create({ data });
 *
 * update:
 *   return prisma.simulado.update({ where: { id }, data });
 *
 * delete:
 *   return prisma.simulado.delete({ where: { id } });
 *
 * findAll:
 *   return prisma.simulado.findMany();
 *
 * A forma final de persistir questionIds depende da decisão do schema Prisma:
 * lista String[] ou uma tabela de relacionamento com as questões.
 */
export class SimuladoRepository {
	// Armazenamento temporário em memória até a persistência do modelo no Prisma.
	private simulados: Simulado[] = [];

	findAll() {
		return this.simulados;
	}

	findById(id: string) {
		return this.simulados.find((simulado) => simulado.id === id) ?? null;
	}

	create(data: CreateSimuladoInput) {
		const now = new Date();
		const simulado: Simulado = {
			id: randomUUID(),
			studentId: data.studentId,
			name: data.name,
			difficulty: data.difficulty,
			questionIds: data.questionIds,
			createdAt: now,
			updatedAt: now,
		};
		this.simulados.push(simulado);
		return simulado;
	}

	update(id: string, data: UpdateSimuladoInput) {
		const simulado = this.findById(id);
		if (!simulado) {
			return null;
		}

		// Atualiza somente os campos enviados no payload.
		if (data.questionIds !== undefined) {
			simulado.questionIds = data.questionIds;
		}
		if (data.name !== undefined) {
			simulado.name = data.name;
		}
		if (data.difficulty !== undefined) {
			simulado.difficulty = data.difficulty;
		}

		simulado.updatedAt = new Date();
		return simulado;
	}

	delete(id: string) {
		const index = this.simulados.findIndex(
			(simulado) => simulado.id === id,
		);

		if (index === -1) {
			return null;
		}

		// A exclusão atual é física: o registro é removido do array em memória.
		const [deletedSimulado] = this.simulados.splice(index, 1);
		return deletedSimulado;
	}
}