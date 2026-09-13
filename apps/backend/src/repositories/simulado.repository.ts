import { randomUUID } from 'node:crypto';
import {
	CreateSimuladoInput,
	Simulado,
	UpdateSimuladoInput,
} from '../schemas/simulado.schema';

export class SimuladoRepository {
	private simulados:Simulado[] = [];

	findAll(){
		return this.simulados;
	}

	findById(id: string) {
		return this.simulados.find((simulado) => simulado.id === id) ?? null;
	}

	create(data: CreateSimuladoInput){
		const now = new Date();
		const simulado: Simulado ={
			id: randomUUID(),
			studentId: data.studentId,
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

		if (data.questionIds !== undefined) {
			simulado.questionIds = data.questionIds;
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
		const [deletedSimulado] = this.simulados.splice(index, 1);
		return deletedSimulado;
	}
}