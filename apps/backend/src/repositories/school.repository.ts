import { prisma } from '../lib/prisma';
import { CreateSchoolInput, UpdateSchoolInput } from '../schemas/school.schema';

export class SchoolRepository{
  async findByName(school_name: string) {
    return prisma.school.findUnique({ where: { school_name } });
  }
  async findById(id: string) {
    return prisma.school.findUnique({ where: { id } });
  }

  async createWithProfile(data: CreateSchoolInput) {
    return prisma.$transaction(async (tx) =>{
      const school = await tx.school.create({
        data: {
          school_name: data.school_name,
          school_city: data.school_city,
        },
      });

      return { school };
    });
  }

  async delete(id: string) {
    return prisma.school.delete({ where: { id } });
  }

  async update(id: string, data: UpdateSchoolInput) {
    return prisma.school.update({
      where: { id },
      data,
    });
  }
}
