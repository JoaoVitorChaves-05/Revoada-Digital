import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export function validateSchema(schema: z.ZodType) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			return res.status(400).json({
				error: 'Dados inválidos',
				details: result.error.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message,
				})),
			});
		}

		req.body = result.data;
		return next();
	};
}