import { Router } from 'express';
import { createSchool, readSchool } from '../controllers/schools.controller.ts';
import { validateSchema } from '../middlewares/validate.middleware';
import { createSchoolSchema } from '../schemas/school.schema';

const schoolsRouter = Router();

schoolsRouter.get('/:id', readSchool);
schoolsRouter.post('/', validateSchema(createSchoolSchema), createSchool);

export default schoolsRouter;
