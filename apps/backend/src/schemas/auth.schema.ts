import { z } from 'zod';

export const loginSchema = z.object({
	email: z
		.string()
		.trim()
		.pipe(z.email({ error: 'E-mail inválido' })),
	password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;