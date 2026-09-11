import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApprovalRepository } from '../repositories/approval.repository';
import { ApprovalService } from './approval.service';

function createRepositoryMock() {
	return {
		findPending: vi.fn(),
		findById: vi.fn(),
		findAdminById: vi.fn(),
		update: vi.fn(),
	};
}

describe('ApprovalService', () => {
	let repository: ReturnType<typeof createRepositoryMock>;
	let service: ApprovalService;

	beforeEach(() => {
		repository = createRepositoryMock();
		service = new ApprovalService(repository as unknown as ApprovalRepository);
	});

	it('lista as solicitações pendentes', async () => {
		const pendingApprovals = [{ id: 'approval-1', status: 'PENDING' }];
		repository.findPending.mockResolvedValue(pendingApprovals);

		const result = await service.listPending();

		expect(result).toEqual(pendingApprovals);
		expect(repository.findPending).toHaveBeenCalledOnce();
	});

	it('aprova uma solicitação quando o administrador existe', async () => {
		const approval = { id: 'approval-1', status: 'PENDING' };
		const input = { status: 'APPROVED' as const, adminId: 'admin-1' };
		const updatedApproval = { ...approval, status: 'APPROVED' };
		repository.findById.mockResolvedValue(approval);
		repository.findAdminById.mockResolvedValue({ userId: input.adminId });
		repository.update.mockResolvedValue(updatedApproval);

		const result = await service.updateApproval(approval.id, input);

		expect(result).toEqual(updatedApproval);
		expect(repository.update).toHaveBeenCalledWith(approval.id, input);
	});

	it('rejeita uma solicitação com motivo', async () => {
		const approval = { id: 'approval-1', status: 'PENDING' };
		const input = {
			status: 'REJECTED' as const,
			adminId: 'admin-1',
			rejectionReason: 'Dados incompletos',
		};
		repository.findById.mockResolvedValue(approval);
		repository.findAdminById.mockResolvedValue({ userId: input.adminId });
		repository.update.mockResolvedValue({ ...approval, status: 'REJECTED' });

		await service.updateApproval(approval.id, input);

		expect(repository.update).toHaveBeenCalledWith(approval.id, input);
	});

	it('impede atualização de solicitação inexistente', async () => {
		repository.findById.mockResolvedValue(null);

		await expect(
			service.updateApproval('missing-approval', {
				status: 'APPROVED',
				adminId: 'admin-1',
			}),
		).rejects.toThrow('Solicitação de aprovação não encontrada');
		expect(repository.findAdminById).not.toHaveBeenCalled();
		expect(repository.update).not.toHaveBeenCalled();
	});

	it('impede atualização quando o administrador não existe', async () => {
		repository.findById.mockResolvedValue({ id: 'approval-1', status: 'PENDING' });
		repository.findAdminById.mockResolvedValue(null);

		await expect(
			service.updateApproval('approval-1', {
				status: 'APPROVED',
				adminId: 'missing-admin',
			}),
		).rejects.toThrow('Administrador não encontrado');
		expect(repository.update).not.toHaveBeenCalled();
	});
});