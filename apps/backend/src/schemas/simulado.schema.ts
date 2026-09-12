import { z } from 'zod';

const simuladoFieldsSchema = z.object({
	studentId: z.string().trim().min(1, 'ID do aluno é obrigatório'),
	questionIds: z
		.array(z.string().trim().min(1, 'ID da questão inválido'))
		.min(1, 'O simulado deve possuir pelo menos uma questão'),
});

export const createSimuladoSchema = simuladoFieldsSchema;
export const updateSimuladoSchema = simuladoFieldsSchema
	.omit({ studentId: true })
	.partial();

export type CreateSimuladoInput = z.infer<typeof createSimuladoSchema>;
export type UpdateSimuladoInput = z.infer<typeof updateSimuladoSchema>;

export type Simulado = CreateSimuladoInput & {
	id: string;
	createdAt: Date;
	updatedAt: Date;
};