import {Router} from 'express';
import {login} from '../controllers/auth.controller';
import {validateSchema} from '../middlewares/validate.middleware';
import {loginSchema} from '../schemas/auth.schema';

export const authRouter = Router();

authRouter.post('/login', validateSchema(loginSchema), login);
