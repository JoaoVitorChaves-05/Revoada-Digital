import express from 'express';
import cors from 'cors';
import approvalsRouter from './routes/approvals.routes';
import healthRouter from './routes/health.routes';
import usersRouter from './routes/users.routes';
import simuladosRouter from './routes/simulados.routes';
import schoolsRouter from './routes/schools.routes';
import { questionRoutes } from './routes/question.routes';

export const app = express();

// --- Middlewares Globais ---
app.use('/questions', questionRoutes);
app.use(cors());
app.use(express.json());
app.use('/health', healthRouter);
app.use('/approvals', approvalsRouter);
app.use('/users', usersRouter);
app.use('/simulados', simuladosRouter);
app.use('/school', schoolsRouter);
