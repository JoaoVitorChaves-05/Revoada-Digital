import type { LoginInput } from '../schemas/auth.schema';

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

		const { password, ...safeUser } = user;

		return safeUser;
	}
}