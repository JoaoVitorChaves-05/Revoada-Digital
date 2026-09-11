import { Router } from 'express';
import { createUser, deleteUser, updateUser } from '../controllers/users.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const usersRouter = Router();

// /users/
usersRouter.post('/', validateSchema(createUserSchema), createUser);
usersRouter.put('/:id', validateSchema(updateUserSchema), updateUser);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;
