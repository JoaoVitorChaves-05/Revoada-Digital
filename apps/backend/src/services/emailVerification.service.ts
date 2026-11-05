import { randomBytes } from 'node:crypto';
import { EmailVerificationRepository } from '../repositories/emailVerification.repository';
import { sendVerificationEmail } from '../lib/email';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export class EmailVerificationService {
  constructor(
    private readonly repository = new EmailVerificationRepository(),
  ) {}

  private gerarToken(): string {
    return randomBytes(32).toString('hex');
  }

  private montarUrl(token: string): string {
    const base = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    return `${base}/verificar-email?token=${token}`;
  }

  // Gera token, persiste e dispara o email. Usado no cadastro e no reenvio.
  async enviarVerificacao(userId: string, email: string) {
    const token = this.gerarToken();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await this.repository.createToken(userId, token, expiresAt);
    const url = this.montarUrl(token);
    const resultado = await sendVerificationEmail(email, url);
    return { url, ...resultado };
  }

  // Confirma o email a partir do token.
  async confirmar(token: string) {
    const registro = await this.repository.findByToken(token);
    if (!registro) {
      throw new Error('Token de verificação inválido');
    }
    if (registro.usedAt) {
      throw new Error('Este link de verificação já foi utilizado');
    }
    if (registro.expiresAt.getTime() < Date.now()) {
      throw new Error('Este link de verificação expirou. Solicite um novo.');
    }
    if (registro.user.emailVerified) {
      return { alreadyVerified: true };
    }
    await this.repository.markUsedAndVerifyUser(registro.id, registro.user.id);
    return { alreadyVerified: false };
  }

  // Reenvio: so reenvia se o usuario existe e ainda nao verificou.
  async reenviar(email: string) {
    const user = await this.repository.findUserByEmail(email);
    // Resposta neutra para nao revelar se o email existe (seguranca).
    if (!user || user.emailVerified) {
      return { enviado: false };
    }
    const r = await this.enviarVerificacao(user.id, user.email);
    return { enviado: true, fallback: r.fallback };
  }
}

export const emailVerificationService = new EmailVerificationService();