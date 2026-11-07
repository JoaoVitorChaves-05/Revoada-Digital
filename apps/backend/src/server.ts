import express from 'express';
import cors from 'cors';
import { attemptsRouter } from './routes/attempts.routes';
import { chatRoutes } from './routes/chat.list.routes';
import { approvalsRouter } from './routes/approvals.routes';
import { healthRouter } from './routes/health.routes';
import { usersRouter } from './routes/users.routes';
import { simuladosRouter } from './routes/simulados.routes';
import { schoolsRouter } from './routes/schools.routes';
import { questionRoutes } from './routes/question.routes';
import { authRouter } from './routes/auth.routes';
import { forumRouter } from './routes/forum.routes';
import dashboardRouter from './routes/dashboard.routes';

export const app = express();

// --- Middlewares Globais ---
app.use(cors());
app.use(express.json({ type: ['application/json', 'text/plain', '*/*'] }));
app.use(express.urlencoded({ extended: true }));
app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && 'body' in err) {
        console.error('BAD JSON RECEIVED FROM FRONTEND:', err.message);
    }
    next(err);
});
console.log('Databaseurl:', process.env.DIRECT_URL);
app.use('/health', healthRouter);
app.use('/approvals', approvalsRouter);
app.use('/users', usersRouter);
app.use('/simulados', simuladosRouter);
app.use('/school', schoolsRouter);
app.use('/auth', authRouter);
app.use('/attempts', attemptsRouter);
app.use('/forum', forumRouter);
app.use('/chat', chatRoutes);
app.use('/dashboard', dashboardRouter);
