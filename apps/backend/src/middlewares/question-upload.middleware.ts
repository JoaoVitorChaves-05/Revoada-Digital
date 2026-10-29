import { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024, files: 1 },
	fileFilter: (_req, file, callback) => {
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

		if (!allowedTypes.includes(file.mimetype)) {
			return callback(new Error('A imagem deve ser JPG, PNG ou WebP'));
		}

		callback(null, true);
	},
}).single('image');

export function uploadQuestionImage(req: Request, res: Response, next: NextFunction) {
	upload(req, res, (error: unknown) => {
		if (error) {
			const status = error instanceof MulterError && error.code === 'LIMIT_FILE_SIZE'
				? 413
				: 400;

			return res.status(status).json({
				error: 'Erro ao enviar imagem',
				details: error instanceof Error ? error.message : 'Arquivo inválido',
			});
		}

		next();
	});
}

export function parseQuestionFields(req: Request, res: Response, next: NextFunction) {
	if (req.is('multipart/form-data')) {
		if (req.body.difficulty !== undefined) {
			req.body.difficulty = Number(req.body.difficulty);
		}

		if (typeof req.body.alternatives === 'string') {
			try {
				req.body.alternatives = JSON.parse(req.body.alternatives);
			} catch {
				return res.status(400).json({
					error: 'O campo alternatives deve conter um JSON válido',
				});
			}
		}
	}

	next();
}