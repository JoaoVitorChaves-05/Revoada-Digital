import {Router} from 'express';
import {login} from '../controllers/auth.controller';
import {verifyEmail, resendVerification} from '../controllers/emailVerification.controller';
import {validateSchema} from '../middlewares/validate.middleware';
import {loginSchema} from '../schemas/auth.schema';

export const authRouter = Router();

authRouter.post('/login', validateSchema(loginSchema), login);
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/resend-verification', resendVerification);

export default authRouter;
