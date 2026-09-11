import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

export class UserService {
	constructor(private readonly userRepository = new UserRepository()) {}

	async createUser(data: CreateUserInput) {
		const [emailUser, rgUser] = await Promise.all([
			this.userRepository.findByEmail(data.email),
			this.userRepository.findByRg(data.rg),
		]);

		if (emailUser) {
			throw new Error('Email já cadastrado');
		}

		if (rgUser) {
			throw new Error('RG já cadastrado');
		}

		return this.userRepository.createWithProfileAndApproval(data);
	}

	async readUser(id: string) {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new Error('Usuário não encontrado');
		}

		return user;
	}

	async updateUser(id: string, data: UpdateUserInput) {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new Error('Usuário não encontrado');
		}

		if (data.email && data.email !== user.email) {
			const emailUser = await this.userRepository.findByEmail(data.email);
			if (emailUser) {
				throw new Error('Email já cadastrado');
			}
		}

		if (data.rg && data.rg !== user.rg) {
			const rgUser = await this.userRepository.findByRg(data.rg);
			if (rgUser) {
				throw new Error('RG já cadastrado');
			}
		}

		return this.userRepository.update(id, data);
	}

	async deleteUser(id: string) {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new Error('Usuário não encontrado');
		}

		return this.userRepository.delete(id);
	}
}

export const userService = new UserService();