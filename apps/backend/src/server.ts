import express from 'express';
import cors from 'cors';
import approvalsRouter from './routes/approvals.routes';
import healthRouter from './routes/health.routes';
import usersRouter from './routes/users.routes';
import simuladosRouter from './routes/simulados.routes';
import schoolsRouter from './routes/schools.routes';
import authRouter from './routes/auth.routes';
import attemptsRouter from './routes/attempts.routes';
import forumRouter from './routes/forum.routes';
import { chatRoutes } from './routes/chat.list.routes';

export const app = express();

// --- Middlewares Globais ---
app.use(cors());
app.use(express.json());
app.use('/health', healthRouter);
app.use('/approvals', approvalsRouter);
app.use('/users', usersRouter);
app.use('/simulados', simuladosRouter);
app.use('/school', schoolsRouter);
app.use('/auth', authRouter);
app.use('/attempts', attemptsRouter);
app.use('/forum', forumRouter);
app.use('/chat', chatRoutes);
