import { z } from 'zod';

const simuladoFieldsSchema = {
	studentId: z.string().trim().min(1, 'ID do aluno é obrigatório'),
	name: z.string().trim().min(1, 'Nome do simulado é obrigatório'),
	difficulty: z.string().trim().min(1, 'Dificuldade inválida').optional(),
	questionIds: z
		.array(z.string().trim().min(1, 'ID da questão inválido'))
		.min(1, 'O simulado deve possuir pelo menos uma questão'),
};

export const createSimuladoSchema = z.object(simuladoFieldsSchema);
// Na atualização, todos os campos são opcionais e o aluno não pode ser alterado.
export const updateSimuladoSchema = z.object(simuladoFieldsSchema)
	.omit({ studentId: true })
	.partial();

export type CreateSimuladoInput = z.infer<typeof createSimuladoSchema>;
export type UpdateSimuladoInput = z.infer<typeof updateSimuladoSchema>;

export type Simulado = CreateSimuladoInput & {
	id: string;
	createdAt: Date;
	updatedAt: Date;
};