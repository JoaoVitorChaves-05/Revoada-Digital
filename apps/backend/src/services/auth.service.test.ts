import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
AuthRepository,
AuthService,
EmailNotVerifiedError,
} from './auth.service';

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

const usuarioVerificado = {
id: 'usuario-1',
email: 'aluno@example.com',
password: '123456',
full_name: 'Aluno Exemplo',
profileType: 'STUDENT' as const,
emailVerified: true,
};

describe('AuthService', () => {
let repository: ReturnType<typeof createRepositoryMock>;
let service: AuthService;

beforeEach(() => {
repository = createRepositoryMock();
service = new AuthService(repository as AuthRepository);
});

it('realiza login com email e senha corretos', async () => {
repository.findByEmail.mockResolvedValue({ ...usuarioVerificado });

await expect(
service.login({ email: 'aluno@example.com', password: '123456' }),
).resolves.toEqual({
id: 'usuario-1',
email: 'aluno@example.com',
full_name: 'Aluno Exemplo',
profileType: 'STUDENT',
});

expect(repository.findByEmail).toHaveBeenCalledWith('aluno@example.com');
});

it('rejeita login quando o email não existe', async () => {
repository.findByEmail.mockResolvedValue(null);

await expect(
service.login({ email: 'inexistente@example.com', password: '123456' }),
).rejects.toThrow('Email ou senha inválidos');
});

it('rejeita login quando a senha está incorreta', async () => {
repository.findByEmail.mockResolvedValue({ ...usuarioVerificado });

await expect(
service.login({ email: 'aluno@example.com', password: 'senha-errada' }),
).rejects.toThrow('Email ou senha inválidos');
});

it('bloqueia login quando o email não foi verificado', async () => {
repository.findByEmail.mockResolvedValue({ ...usuarioVerificado, emailVerified: false });

await expect(
service.login({ email: 'aluno@example.com', password: '123456' }),
).rejects.toBeInstanceOf(EmailNotVerifiedError);
});

it('não retorna a senha após o login', async () => {
repository.findByEmail.mockResolvedValue({ ...usuarioVerificado });

const result = await service.login({ email: 'aluno@example.com', password: '123456' });

expect(result).not.toHaveProperty('password');
});
});