import { Router } from 'express';
import { createUser, readUser, deleteUser, updateUser } from '../controllers/users.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const usersRouter = Router();

// /users/
usersRouter.get('/:id', readUser);
usersRouter.post('/', validateSchema(createUserSchema), createUser);
usersRouter.put('/:id', validateSchema(updateUserSchema), updateUser);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;
