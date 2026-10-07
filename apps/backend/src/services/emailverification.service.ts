import crypto from 'node:crypto';
import { UserRepository } from '../repositories/user.repository';
import { sendVerificationEmail } from './email.service';

const TTL_MS = 24 * 60 * 60 * 1000;
const secret = () => {
	if (!process.env.EMAIL_TOKEN_SECRET) throw new Error('EMAIL_TOKEN_SECRET não configurado');
	return process.env.EMAIL_TOKEN_SECRET;
};

const sign = (payload: string) =>
	crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

function createToken(userId: string, email: string) {
	const payload = Buffer.from(JSON.stringify({ uid: userId, email, exp: Date.now() + TTL_MS })).toString('base64url');
	return `${payload}.${sign(payload)}`;
}

export function readToken(token: string): { uid: string; email: string } {
	const [payload, signature] = token.split('.');
	if (!payload || !signature) throw new Error('Link inválido');

	const expected = Buffer.from(sign(payload));
	const received = Buffer.from(signature);
	if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
		throw new Error('Link inválido');
	}

	const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
	if (data.exp < Date.now()) throw new Error('Link expirado');
	return data;
}

export class EmailVerificationService {
	constructor(private readonly users = new UserRepository()) {}

	async send(email: string) {
		const user = await this.users.findByEmail(email);
		if (!user) return; // não revela se o e-mail existe
		await sendVerificationEmail(user.email, user.full_name, createToken(user.id, user.email));
	}

	async verify(token: string) {
		const { uid, email } = readToken(token);
		const user = await this.users.findById(uid);
		if (!user || user.email !== email) throw new Error('Link inválido');
		return { email: user.email };
	}
}

export const emailVerificationService = new EmailVerificationService();