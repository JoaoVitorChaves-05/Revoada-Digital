import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from './user.service';

const userInput = {
	email: 'aluno@example.com',
	full_name: 'Aluno Exemplo',
	rg: '123456789',
	cpf: '12345678901',
	profileType: 'STUDENT' as const,
	school: 'Escola Exemplo',
};

function createRepositoryMock() {
	return {
		findByEmail: vi.fn(),
		findByRg: vi.fn(),
		findById: vi.fn(),
		createWithProfileAndApproval: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	};
}

describe('UserService', () => {
	let repository: ReturnType<typeof createRepositoryMock>;
	let service: UserService;

	beforeEach(() => {
		repository = createRepositoryMock();
		service = new UserService(repository as unknown as UserRepository);
	});

	it('cria usuário quando email e RG ainda não existem', async () => {
		const createdUser = { id: 'user-1', ...userInput };
		repository.findByEmail.mockResolvedValue(null);
		repository.findByRg.mockResolvedValue(null);
		repository.createWithProfileAndApproval.mockResolvedValue({ user: createdUser });

		const result = await service.createUser(userInput);

		expect(result).toEqual({ user: createdUser });
		expect(repository.createWithProfileAndApproval).toHaveBeenCalledWith(userInput);
	});

	it('impede cadastro com email já utilizado', async () => {
		repository.findByEmail.mockResolvedValue({ id: 'existing-user' });
		repository.findByRg.mockResolvedValue(null);

		await expect(service.createUser(userInput)).rejects.toThrow('Email já cadastrado');
		expect(repository.createWithProfileAndApproval).not.toHaveBeenCalled();
	});

	it('impede cadastro com RG já utilizado', async () => {
		repository.findByEmail.mockResolvedValue(null);
		repository.findByRg.mockResolvedValue({ id: 'existing-user' });

		await expect(service.createUser(userInput)).rejects.toThrow('RG já cadastrado');
		expect(repository.createWithProfileAndApproval).not.toHaveBeenCalled();
	});

	it('atualiza usuário existente', async () => {
		const currentUser = { id: 'user-1', email: userInput.email, rg: userInput.rg };
		const update = { full_name: 'Nome Atualizado' };
		repository.findById.mockResolvedValue(currentUser);
		repository.update.mockResolvedValue({ ...currentUser, ...update });

		const result = await service.updateUser(currentUser.id, update);

		expect(result).toEqual({ ...currentUser, ...update });
		expect(repository.update).toHaveBeenCalledWith(currentUser.id, update);
	});

	it('impede atualização para email já utilizado por outro usuário', async () => {
		repository.findById.mockResolvedValue({ id: 'user-1', email: 'old@example.com', rg: userInput.rg });
		repository.findByEmail.mockResolvedValue({ id: 'user-2' });

		await expect(service.updateUser('user-1', { email: 'used@example.com' })).rejects.toThrow(
			'Email já cadastrado',
		);
		expect(repository.update).not.toHaveBeenCalled();
	});

	it('impede atualização de usuário inexistente', async () => {
		repository.findById.mockResolvedValue(null);

		await expect(service.updateUser('missing-user', { full_name: 'Nome' })).rejects.toThrow(
			'Usuário não encontrado',
		);
	});

	it('remove usuário existente', async () => {
		repository.findById.mockResolvedValue({ id: 'user-1' });
		repository.delete.mockResolvedValue({ id: 'user-1' });

		await service.deleteUser('user-1');

		expect(repository.delete).toHaveBeenCalledWith('user-1');
	});

	it('impede remoção de usuário inexistente', async () => {
		repository.findById.mockResolvedValue(null);

		await expect(service.deleteUser('missing-user')).rejects.toThrow('Usuário não encontrado');
		expect(repository.delete).not.toHaveBeenCalled();
	});
});