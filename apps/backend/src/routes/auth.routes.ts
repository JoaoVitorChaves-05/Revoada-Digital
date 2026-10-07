import { Router } from 'express';
import { z } from 'zod';
import { emailVerificationService } from '../services/emailverification.service';

const authRouter = Router();

authRouter.post('/send-verification', async (req, res) => {
	const parsed = z.object({ email: z.string().trim().toLowerCase().email() }).safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'E-mail inválido' });

	try {
		await emailVerificationService.send(parsed.data.email);
	} catch (error) {
		console.error('Erro ao enviar e-mail de verificação:', error);
	}
	// Resposta sempre igual, para não revelar quais e-mails existem
	return res.status(200).json({ message: 'Se o e-mail existir, enviaremos o link de confirmação.' });
});

authRouter.post('/verify-email', async (req, res) => {
	const parsed = z.object({ token: z.string().min(10) }).safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Link inválido' });

	try {
		await emailVerificationService.verify(parsed.data.token);
		return res.status(200).json({ message: 'E-mail confirmado com sucesso!' });
	} catch (error: any) {
		return res.status(400).json({ error: 'Erro ao confirmar e-mail', details: error.message });
	}
});

export default authRouter;