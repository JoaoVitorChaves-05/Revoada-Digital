import { Router } from 'express';
import { createSchool, readSchool, updateSchool, deleteSchool } from '../controllers/schools.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { createSchoolSchema, updateSchoolSchema } from '../schemas/school.schema';

const schoolsRouter = Router();

schoolsRouter.get('/:id', readSchool);
schoolsRouter.post('/', validateSchema(createSchoolSchema), createSchool);
schoolsRouter.put('/:id', validateSchema(updateSchoolSchema), updateSchool);
schoolsRouter.delete('/:id', deleteSchool);
export default schoolsRouter;
