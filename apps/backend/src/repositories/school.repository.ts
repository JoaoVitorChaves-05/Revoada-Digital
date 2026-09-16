import { prisma } from '../lib/prisma':
import { CreateSchoolInput } from '../schemas/school.schema';

export class SchoolRepository{
  async findByName(school_name: string) {
    return prisma.school.findUnique({ where: { school_name } });
  }
  async findById(id: string) {
    return prisma.school.findUnique({ where: { id } });
  }

  async createWithProfileAndApproval(data: CreateSchoolInput) {
    return prisma.$transaction(async (tx) =>{
      const school = await tx.school.create({
        data: {
          school_name: data.school_name,
          school_city: data.school_city,
        },
      });

      const approvalRequest = await tx.approvalRequest.create({
        data: {schoolId: school.id},
      });

      return { school, approvalRequest };
    });
  }
}
