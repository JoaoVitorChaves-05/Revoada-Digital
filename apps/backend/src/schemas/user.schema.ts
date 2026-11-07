import { z } from 'zod';

const profileTypeSchema = z.enum(['STUDENT', 'TEACHER', 'ADMIN']);

const userFieldsSchema = z.object({
email: z.string().trim().email('E-mail inválido'),
full_name: z.string().trim().min(1, 'Nome completo é obrigatório'),
rg: z.string().regex(/^\d{9}$/, 'RG deve conter exatamente 9 dígitos'),
cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter exatamente 11 dígitos'),
profileType: profileTypeSchema,
school: z.string().trim().min(1, 'Escola é obrigatória').optional(),
year: z
.number({ error: 'Série deve ser um número' })
.int('Série deve ser um número inteiro')
.min(1, 'Série deve ser entre 1 e 3')
.max(3, 'Série deve ser entre 1 e 3')
.optional(),
});

export const createUserSchema = userFieldsSchema
.extend({
password: z.string().min(1, 'Senha é obrigatória'),
})
.superRefine((data, context) => {
if (data.profileType !== 'ADMIN' && !data.school) {
context.addIssue({
code: 'custom',
path: ['school'],
message: 'Escola é obrigatória para estudantes e professores',
});
}
if (data.profileType === 'STUDENT' && data.year === undefined) {
context.addIssue({
code: 'custom',
path: ['year'],
message: 'Série é obrigatória para estudantes',
});
}
});

export const updateUserSchema = userFieldsSchema.partial().superRefine((data, context) => {
if (data.profileType && data.profileType !== 'ADMIN' && !data.school) {
context.addIssue({
code: 'custom',
path: ['school'],
message: 'Escola é obrigatória ao definir perfil de estudante ou professor',
});
}
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
