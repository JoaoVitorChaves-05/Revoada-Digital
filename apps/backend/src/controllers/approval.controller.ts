import { Request, Response } from 'express';
import { approvalService } from '../services/approval.service';

export async function listPendingApprovals(_req: Request, res: Response) {
	try {
		const pendingRequests = await approvalService.listPending();
		return res.status(200).json(pendingRequests);
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}

export async function updateApproval(req: Request, res: Response) {
	const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

	try {
		const updatedRequest = await approvalService.updateApproval(id, req.body);
		const message = req.body.status === 'APPROVED' ? 'aprovada' : 'rejeitada';

		return res.status(200).json({
			message: `Solicitação ${message} com sucesso.`,
			updatedRequest,
		});
	} catch (error: any) {
		return res.status(400).json({ error: error.message });
	}
}