import type { LoginInput } from '../schemas/auth.schema';
import { UserRepository } from '../repositories/user.repository';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

type AuthUser = {
id: string;
email: string;
password: string | null;
full_name: string;
profileType: 'STUDENT' | 'TEACHER' | 'ADMIN';
emailVerified: boolean;
};

export class EmailNotVerifiedError extends Error {
constructor() {
super('Confirme seu email antes de entrar');
this.name = 'EmailNotVerifiedError';
}
}

export interface AuthRepository {
findByEmail(email: string): Promise<AuthUser | null>;
}

export class AuthService {
	constructor(private readonly authRepository: AuthRepository) {}

	async login(data: LoginInput) {
		const user = await this.authRepository.findByEmail(data.email);

		if (!user || !user.password) {
			throw new Error('Email ou senha inválidos');
		}

		const passwordMatches = await compare(
			data.password,
			user.password,
		);

		if (!passwordMatches) {
			throw new Error('Email ou senha inválidos');
		}

		const secretKey = process.env.JWT_SECRET;

		if (!secretKey || !secretKey.trim()) {
			throw new Error('JWT_SECRET não configurado');
		}

		const token = jwt.sign({}, secretKey, {
			algorithm: 'HS256',
			subject: user.id,
			expiresIn: '24h',
		});

		return {
			token,
			user: {
				id: user.id,
				email: user.email,
				full_name: user.full_name,
				profileType: user.profileType,
			},
		};
	}
}

export const authService = new AuthService(new UserRepository());