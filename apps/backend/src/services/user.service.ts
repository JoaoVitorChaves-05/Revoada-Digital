import { CreateUserInput } from '../schemas/user.schema';
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
}

export const userService = new UserService();