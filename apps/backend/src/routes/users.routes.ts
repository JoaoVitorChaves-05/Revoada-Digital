import { Router } from 'express';
import { createUser } from '../controllers/users.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { createUserSchema } from '../schemas/user.schema';

const usersRouter = Router();

// /users/
usersRouter.post('/', validateSchema(createUserSchema), createUser);

export default usersRouter;
