import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { AuthRepository } from './auth.service';
import { AuthService } from './auth.service';

vi.mock('../repositories/user.repository', () => ({
UserRepository: class {
findByEmail = vi.fn();
},
}));

function createRepositoryMock() {
return {
findByEmail: vi.fn(),
};
}

// chave fictícia, exclusivo dos testes.
const JWT_SECRET_TEST = 'chave-jwt-apenas-para-testes';

const loginInput = {
	email: 'aluno@example.com',
	password: '123456',
};

describe('AuthService', () => {
	let repository: ReturnType<typeof createRepositoryMock>;
	let service: AuthService;
	let passwordHash: string;

	beforeAll(async () => {
		passwordHash = await hash(loginInput.password, 10);
	});

	beforeEach(() => {
		vi.stubEnv('JWT_SECRET', JWT_SECRET_TEST);

		repository = createRepositoryMock();
		service = new AuthService(repository as AuthRepository);

		repository.findByEmail.mockResolvedValue({
			id: 'usuario-1',
			email: loginInput.email,
			password: passwordHash,
			full_name: 'Aluno Exemplo',
			profileType: 'STUDENT',
		});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('realiza login e emite JWT válido com duração de uma hora', async () => {
		const result = await service.login(loginInput);

		expect(result.user).toEqual({
			id: 'usuario-1',
			email: loginInput.email,
			full_name: 'Aluno Exemplo',
			profileType: 'STUDENT',
		});

		expect(result.token).toEqual(expect.any(String));

		const decoded = jwt.verify(result.token, JWT_SECRET_TEST, {
			algorithms: ['HS256'],
		});

		if (typeof decoded === 'string') {
			throw new Error('Payload inesperado no teste');
		}

		expect(decoded.sub).toBe('usuario-1');
		expect(decoded.iat).toEqual(expect.any(Number));
		expect(decoded.exp).toEqual(expect.any(Number));
		expect(decoded.exp! - decoded.iat!).toBe(86400);
		expect(decoded).not.toHaveProperty('password');

		expect(repository.findByEmail).toHaveBeenCalledWith(
			loginInput.email,
		);
	});

	it('rejeita login quando o email não existe', async () => {
		repository.findByEmail.mockResolvedValue(null);

		await expect(
			service.login({
				...loginInput,
				email: 'inexistente@example.com',
			}),
		).rejects.toThrow('Email ou senha inválidos');
	});

	it('rejeita login quando a senha está incorreta', async () => {
		await expect(
			service.login({
				...loginInput,
				password: 'senha-errada',
			}),
		).rejects.toThrow('Email ou senha inválidos');
	});

	it('não retorna senha nem hash após o login', async () => {
		const result = await service.login(loginInput);

		expect(result).not.toHaveProperty('password');
		expect(result.user).not.toHaveProperty('password');
		expect(JSON.stringify(result)).not.toContain(passwordHash);
	});

	it('rejeita login quando o usuário não possui senha', async () => {
		repository.findByEmail.mockResolvedValue({
			id: 'usuario-1',
			email: loginInput.email,
			password: null,
			full_name: 'Aluno Exemplo',
			profileType: 'STUDENT',
		});

		await expect(
			service.login(loginInput),
		).rejects.toThrow('Email ou senha inválidos');
	});

	it('não emite token quando JWT_SECRET não está configurado', async () => {
		vi.stubEnv('JWT_SECRET', undefined);

		await expect(
			service.login(loginInput),
		).rejects.toThrow('JWT_SECRET não configurado');
	});

	it('não emite token quando JWT_SECRET contém apenas espaços', async () => {
		vi.stubEnv('JWT_SECRET', '   ');

		await expect(
			service.login(loginInput),
		).rejects.toThrow('JWT_SECRET não configurado');
	});
});

// Cenário da admin "Layza Administradora" criada via userService.
// NÃO usa o banco de produção nem a senha/segredo reais: reproduz o caso com
// o hash bcrypt real de uma senha fictícia e repositório mockado, validando o
// mesmo comportamento (compara senha com hash, emite JWT com perfil ADMIN).
describe('AuthService - login de administrador', () => {
	// Dados fictícios de teste, não são as credenciais reais de produção.
	const adminLogin = {
		email: 'admin.teste@example.com',
		password: 'senha-admin-teste',
	};

	let repository: ReturnType<typeof createRepositoryMock>;
	let service: AuthService;
	let adminPasswordHash: string;

	beforeAll(async () => {
		adminPasswordHash = await hash(adminLogin.password, 10);
	});

	beforeEach(() => {
		vi.stubEnv('JWT_SECRET', JWT_SECRET_TEST);

		repository = createRepositoryMock();
		service = new AuthService(repository as AuthRepository);

		repository.findByEmail.mockResolvedValue({
			id: 'admin-layza',
			email: adminLogin.email,
			password: adminPasswordHash,
			full_name: 'Layza Administradora',
			profileType: 'ADMIN',
			emailVerified: false,
		});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('autentica a administradora e emite JWT com perfil ADMIN', async () => {
		const result = await service.login(adminLogin);

		expect(result.user).toEqual({
			id: 'admin-layza',
			email: adminLogin.email,
			full_name: 'Layza Administradora',
			profileType: 'ADMIN',
		});

		expect(result.token).toEqual(expect.any(String));

		const decoded = jwt.verify(result.token, JWT_SECRET_TEST, {
			algorithms: ['HS256'],
		});

		if (typeof decoded === 'string') {
			throw new Error('Payload inesperado no teste');
		}

		expect(decoded.sub).toBe('admin-layza');
		expect(decoded.exp! - decoded.iat!).toBe(86400);

		expect(repository.findByEmail).toHaveBeenCalledWith(adminLogin.email);
	});

	it('valida a senha contra o hash bcrypt real (rejeita senha incorreta)', async () => {
		await expect(
			service.login({ ...adminLogin, password: 'senha-errada' }),
		).rejects.toThrow('Email ou senha inválidos');
	});

	it('não expõe a senha nem o hash no resultado do login', async () => {
		const result = await service.login(adminLogin);

		expect(result).not.toHaveProperty('password');
		expect(result.user).not.toHaveProperty('password');
		expect(JSON.stringify(result)).not.toContain(adminPasswordHash);
	});
});