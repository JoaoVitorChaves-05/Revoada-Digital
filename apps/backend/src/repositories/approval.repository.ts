import { prisma } from '../lib/prisma';
import { UpdateApprovalInput } from '../schemas/approval.schema';

export class ApprovalRepository {
	async findPending() {
		return prisma.approvalRequest.findMany({
			where: { status: 'PENDING' },
			include: {
				user: {
					select: {
						id: true,
						full_name: true,
						email: true,
						profileType: true,
						createdAt: true,
					},
				},
			},
		});
	}

	findById(id: string) {
		return prisma.approvalRequest.findUnique({ where: { id } });
	}

	findAdminById(adminId: string) {
		return prisma.adminProfile.findUnique({ where: { userId: adminId } });
	}

	update(id: string, data: UpdateApprovalInput) {
		return prisma.approvalRequest.update({
			where: { id },
			data: {
				status: data.status,
				approvedById: data.adminId,
				rejectionReason: data.status === 'REJECTED' ? data.rejectionReason : null,
			},
		});
	}
}