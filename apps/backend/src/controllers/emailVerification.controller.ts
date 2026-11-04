import { Request, Response } from 'express';
import { emailVerificationService } from '../services/emailVerification.service';

// GET /auth/verify-email?token=...
export async function verifyEmail(req: Request, res: Response) {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  if (!token) {
    return res.status(400).json({ error: 'Token é obrigatório' });
  }
  try {
    const result = await emailVerificationService.confirmar(token);
    const message = result.alreadyVerified
      ? 'Email já estava confirmado. Você já pode entrar.'
      : 'Email confirmado com sucesso! Você já pode entrar.';
    return res.status(200).json({ message });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao confirmar email';
    return res.status(400).json({ error: msg });
  }
}

// POST /auth/resend-verification  { email }
export async function resendVerification(req: Request, res: Response) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  try {
    await emailVerificationService.reenviar(email);
    // Resposta neutra: nao revela se o email existe.
    return res.status(200).json({
      message: 'Se houver uma conta pendente para este email, um novo link foi enviado.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao reenviar verificação' });
  }
}