import {
 CreateSimuladoInput,
 UpdateSimuladoInput,
} from '../schemas/simulado.schema';
import { SimuladoRepository } from '../repositories/simulado.repository';


// REGRAS DE NEGÓCIO: recebe e retorna dados ou lança um erro (UserBusinessError).


export class SimuladoService {
 constructor(private readonly simuladoRepository = new SimuladoRepository()) { }

 async createSimulado(data: CreateSimuladoInput) {
  return this.simuladoRepository.create(data);
 }

 async listSimulados() {
	return this.simuladoRepository.findAll();
 }

 async readSimulado(id: string) {
	const simulado = this.simuladoRepository.findById(id);

	if (!simulado) {
		throw new Error('Simulado não encontrado');
	}

	return simulado;
 }

 async updateSimulado(id: string, data: UpdateSimuladoInput) {
  const simulado = this.simuladoRepository.findById(id);
  if (!simulado) {
   // A checagem evita atualizar um registro inexistente e permite retornar 404.
   throw new Error('Simulado não encontrado');
  }

  return this.simuladoRepository.update(id, data);
 }

 async deleteSimulado(id: string) {
  const simulado = this.simuladoRepository.findById(id);
  if (!simulado) {
   // A deleção só é executada depois que a existência do recurso foi confirmada.
   throw new Error('Simulado não encontrado');
  }

  return this.simuladoRepository.delete(id);
 }
}

export const simuladoService = new SimuladoService();