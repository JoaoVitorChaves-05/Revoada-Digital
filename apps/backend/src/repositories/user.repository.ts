import { prisma } from '../lib/prisma';
import { CreateUserInput } from '../schemas/user.schema';

export class UserRepository {
	async findByEmail(email: string) {
		return prisma.user.findUnique({ where: { email } });
	}

	async findByRg(rg: string) {
		return prisma.user.findUnique({ where: { rg } });
	}

	async createWithProfileAndApproval(data: CreateUserInput) {
		return prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					email: data.email,
					full_name: data.full_name,
					rg: data.rg,
					cpf: data.cpf,
					profileType: data.profileType,
				},
			});

			if (data.profileType === 'STUDENT') {
				await tx.studentProfile.create({
					data: { userId: user.id, school: data.school as string },
				});
			} else if (data.profileType === 'TEACHER') {
				await tx.teacherProfile.create({
					data: { userId: user.id, school: data.school as string },
				});
			} else {
				await tx.adminProfile.create({ data: { userId: user.id } });
			}

			const approvalRequest = await tx.approvalRequest.create({
				data: { userId: user.id },
			});

			return { user, approvalRequest };
		});
	}
}