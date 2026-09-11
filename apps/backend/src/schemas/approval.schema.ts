import { z } from 'zod';

export const updateApprovalSchema = z
	.object({
		status: z.enum(['APPROVED', 'REJECTED']),
		adminId: z.string().uuid('ID do administrador inválido'),
		rejectionReason: z.string().trim().min(1, 'Motivo da rejeição é obrigatório').optional(),
	})
	.superRefine((data, context) => {
		if (data.status === 'REJECTED' && !data.rejectionReason) {
			context.addIssue({
				code: 'custom',
				path: ['rejectionReason'],
				message: 'Motivo da rejeição é obrigatório',
			});
		}
	});

export type UpdateApprovalInput = z.infer<typeof updateApprovalSchema>;