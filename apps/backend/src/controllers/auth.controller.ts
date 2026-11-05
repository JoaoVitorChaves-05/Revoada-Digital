import { Request, Response } from 'express';
import { authService, EmailNotVerifiedError } from '../services/auth.service';

export async function login(req: Request, res: Response) {
try {
const user = await authService.login(req.body);
return res.status(200).json({
message: 'Login realizado com sucesso',
user,
});
} catch (error) {
if (error instanceof EmailNotVerifiedError) {
return res.status(403).json({ message: error.message, code: 'EMAIL_NOT_VERIFIED' });
}
if (error instanceof Error && error.message === 'Email ou senha inválidos') {
return res.status(401).json({ message: error.message });
}
return res.status(500).json({
error: 'Ocorreu um erro ao processar a solicitação de login',
});
}
}