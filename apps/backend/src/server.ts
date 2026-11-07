import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import approvalsRouter from './routes/approvals.routes';
import healthRouter from './routes/health.routes';
import usersRouter from './routes/users.routes';
import simuladosRouter from './routes/simulados.routes';
import schoolsRouter from './routes/schools.routes';
import { questionRoutes } from './routes/question.routes';
import authRouter from './routes/auth.routes';
import attemptsRouter from './routes/attempts.routes';
import forumRouter from './routes/forum.routes';
import { chatRoutes } from './routes/chat.list.routes';
import dashboardRouter from './routes/dashboard.routes';

export const app = express();

// --- CORS ---
// Origens permitidas configuráveis por env (CORS_ORIGINS, separadas por vírgula).
// Em produção, inclui o frontend no Vercel por padrão. O preflight (OPTIONS) é
// respondido explicitamente para evitar depender do comportamento default do
// middleware no runtime serverless.
const defaultOrigins = [
	'https://revoada-digital-frontend.vercel.app',
	'http://localhost:5173',
];

const allowedOrigins = (process.env.CORS_ORIGINS
	? process.env.CORS_ORIGINS.split(',')
	: defaultOrigins
).map((origin) => origin.trim()).filter(Boolean);

const corsOptions: CorsOptions = {
	origin(origin, callback) {
		// Requisições sem Origin (ex.: curl, health checks) são permitidas.
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
			return;
		}
		callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
	},
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
};

// --- Middlewares Globais ---
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use('/health', healthRouter);
app.use('/approvals', approvalsRouter);
app.use('/users', usersRouter);
app.use('/simulados', simuladosRouter);
app.use('/school', schoolsRouter);
app.use('/questions', questionRoutes);
app.use('/auth', authRouter);
app.use('/attempts', attemptsRouter);
app.use('/forum', forumRouter);
app.use('/chat', chatRoutes);
app.use('/dashboard', dashboardRouter);
