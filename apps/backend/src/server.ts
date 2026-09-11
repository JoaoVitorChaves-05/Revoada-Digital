import express from 'express';
import cors from 'cors';
import approvalsRouter from './routes/approvals.routes';
import healthRouter from './routes/health.routes';
import usersRouter from './routes/users.routes';

export const app = express();

// --- Middlewares Globais ---
app.use(cors());
app.use(express.json());
app.use('/health', healthRouter);
app.use('/approvals', approvalsRouter);
app.use('/users', usersRouter);

