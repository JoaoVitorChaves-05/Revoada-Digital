import { describe, expect, it } from 'vitest';
import { updateApprovalSchema } from './approval.schema';

const adminId = '550e8400-e29b-41d4-a716-446655440000';

describe('updateApprovalSchema', () => {
	it('aceita aprovação com administrador válido', () => {
		const result = updateApprovalSchema.safeParse({ status: 'APPROVED', adminId });

		expect(result.success).toBe(true);
	});

	it('aceita rejeição com motivo', () => {
		const result = updateApprovalSchema.safeParse({
			status: 'REJECTED',
			adminId,
			rejectionReason: 'Documentação inválida',
		});

		expect(result.success).toBe(true);
	});

	it('rejeita rejeição sem motivo', () => {
		const result = updateApprovalSchema.safeParse({ status: 'REJECTED', adminId });

		expect(result.success).toBe(false);
	});

	it('rejeita administrador com ID inválido', () => {
		const result = updateApprovalSchema.safeParse({ status: 'APPROVED', adminId: 'admin-1' });

		expect(result.success).toBe(false);
	});

	it('rejeita status não permitido', () => {
		const result = updateApprovalSchema.safeParse({ status: 'PENDING', adminId });

		expect(result.success).toBe(false);
	});
});