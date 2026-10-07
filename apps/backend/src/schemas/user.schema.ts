import { z } from 'zod';

const profileTypeSchema = z.enum(['STUDENT', 'TEACHER', 'ADMIN']);

const userFieldsSchema = z.object({
	email: z.string().trim().email('E-mail inválido'),
	full_name: z.string().trim().min(1, 'Nome completo é obrigatório'),
	//rg: z.string().regex(/^\d{9}$/, 'RG deve conter exatamente 9 dígitos'),
	cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter exatamente 11 dígitos'),
	profileType: profileTypeSchema,
	school: z.string().trim().min(1, 'Escola é obrigatória').optional(),
});

export const createUserSchema = userFieldsSchema;
export const updateUserSchema = userFieldsSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;