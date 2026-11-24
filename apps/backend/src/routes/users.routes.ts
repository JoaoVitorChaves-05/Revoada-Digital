import { Router } from 'express';
import { createUser, readUser, deleteUser, updateUser, getMyPoints } from '../controllers/users.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const usersRouter = Router();

// /users/
usersRouter.get('/me/points', ensureAuthenticated, getMyPoints);
usersRouter.get('/:id', readUser);
usersRouter.post('/', validateSchema(createUserSchema), createUser);
usersRouter.put('/:id', validateSchema(updateUserSchema), updateUser);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;
