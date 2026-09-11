import { ApprovalRepository } from '../repositories/approval.repository';
import { UpdateApprovalInput } from '../schemas/approval.schema';

export class ApprovalService {
	constructor(private readonly approvalRepository = new ApprovalRepository()) {}

	listPending() {
		return this.approvalRepository.findPending();
	}

	async updateApproval(id: string, data: UpdateApprovalInput) {
		const approval = await this.approvalRepository.findById(id);
		if (!approval) {
			throw new Error('Solicitação de aprovação não encontrada');
		}

		const admin = await this.approvalRepository.findAdminById(data.adminId);
		if (!admin) {
			throw new Error('Administrador não encontrado');
		}

		return this.approvalRepository.update(id, data);
	}
}

export const approvalService = new ApprovalService();