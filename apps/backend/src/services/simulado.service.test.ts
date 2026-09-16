import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SimuladoRepository } from '../repositories/simulado.repository';
import { SimuladoService } from './simulado.service';

vi.mock('../repositories/simulado.repository', () => ({
 SimuladoRepository: class { },
}));

function createRepositoryMock() {
 return {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
 };
}

describe('SimuladoService', () => {
 let repository: ReturnType<typeof createRepositoryMock>;
 let service: SimuladoService;

 beforeEach(() => {
  repository = createRepositoryMock();
  service = new SimuladoService(repository as unknown as SimuladoRepository);
 });

 it('cria um simulado', async () => {
	const data = {
		studentId: 'aluno-1',
		questionIds: ['questao-1', 'questao-2'],
	};

	const createdSimulado = {
		id: 'simulado-1',
		...data,
	};

	repository.create.mockReturnValue(createdSimulado);
	await expect(service.createSimulado(data)).resolves.toEqual(
		createdSimulado,
	);
	expect(repository.create).toHaveBeenCalledWith(data);
 });

 it('lista todos os simulados', async () => {
	const simulados = [
		{
			id: 'simulado-1',
			studentId: 'aluno-1',
			questionIds: ['questao-1'],
		},
	];

	repository.findAll.mockReturnValue(simulados);
	await expect(service.listSimulados()).resolves.toEqual(simulados);
	expect(repository.findAll).toHaveBeenCalled();
 });

 it('busca um simulado existente pelo ID', async () => {
	const simulado = {
		id: 'simulado-1',
		studentId: 'aluno-1',
		questionIds: ['questao-1'],
	};

	repository.findById.mockReturnValue(simulado);

	await expect(
		service.readSimulado('simulado-1'),
	).resolves.toEqual(simulado);

	expect(repository.findById).toHaveBeenCalledWith('simulado-1');
 });

 it('impede a busca de um simulado inexistente', async () => {
	repository.findById.mockReturnValue(null);
	await expect(
		service.readSimulado('missing-simulado'),
	).rejects.toThrow('Simulado não encontrado');
 });

 it('atualiza um simulado existente', async () => {
  const currentSimulado = { id: 'simulado-1' };
  const update = { name: 'Revisão', difficulty: 'Média' };
  repository.findById.mockReturnValue(currentSimulado);
  repository.update.mockReturnValue({ ...currentSimulado, ...update });

  await expect(service.updateSimulado(currentSimulado.id, update)).resolves.toEqual({
   ...currentSimulado,
   ...update,
  });
  expect(repository.update).toHaveBeenCalledWith(currentSimulado.id, update);
 });

 it('impede atualização de simulado inexistente', async () => {
  repository.findById.mockReturnValue(null);

  await expect(
   service.updateSimulado('missing-simulado', { name: 'Revisão' }),
  ).rejects.toThrow('Simulado não encontrado');
  expect(repository.update).not.toHaveBeenCalled();
 });

 it('impede remoção de simulado inexistente', async () => {
  repository.findById.mockReturnValue(null);

  await expect(service.deleteSimulado('missing-simulado')).rejects.toThrow(
   'Simulado não encontrado',
  );
  expect(repository.delete).not.toHaveBeenCalled();
 });
});