import { z } from 'zod';

const schoolFieldsSchema = z.object({
  school_name: z.string().trim().min(1, 'Nome da escola é obrigatório'),
  school_city: z.string().trim().min(1, 'Cidade da escola é obrigatória'),
})

export const createSchoolSchema = schoolFieldsSchema;

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
