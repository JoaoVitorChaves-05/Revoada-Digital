import type { LoginInput } from '../schemas/auth.schema';
import { UserRepository } from '../repositories/user.repository';

type AuthUser = {
	id: string;
	email: string;
	password: string | null;
	full_name: string;
	profileType: 'STUDENT' | 'TEACHER' | 'ADMIN';
};

export interface AuthRepository {
	findByEmail(email: string): Promise<AuthUser | null>;
}

export class AuthService {
	constructor(private readonly authRepository: AuthRepository) {}

	async login(data: LoginInput) {
		const user = await this.authRepository.findByEmail(data.email);

		if (!user || user.password !== data.password) {
			throw new Error('Email ou senha inválidos');
		}

		return {
			id: user.id,
			email: user.email,
			full_name: user.full_name,
			profileType: user.profileType,
		};
	}
}

export const authService = new AuthService(new UserRepository());