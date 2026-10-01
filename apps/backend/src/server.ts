import express from 'express';
import cors from 'cors';
import approvalsRouter from './routes/approvals.routes';
import healthRouter from './routes/health.routes';
import usersRouter from './routes/users.routes';
import simuladosRouter from './routes/simulados.routes';
import schoolsRouter from './routes/schools.routes';
<<<<<<< Updated upstream
import authRouter from './routes/auth.routes';
=======
import attemptsRouter from './routes/attempts.routes';
>>>>>>> Stashed changes

export const app = express();

// --- Middlewares Globais ---
app.use(cors());
app.use(express.json());
app.use('/health', healthRouter);
app.use('/approvals', approvalsRouter);
app.use('/users', usersRouter);
app.use('/simulados', simuladosRouter);
app.use('/school', schoolsRouter);
<<<<<<< Updated upstream
app.use('/auth', authRouter);
=======
app.use('/attempts', attemptsRouter);
>>>>>>> Stashed changes
