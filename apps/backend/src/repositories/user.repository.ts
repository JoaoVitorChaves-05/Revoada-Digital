import { prisma } from '../lib/prisma';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

export class UserRepository {
	async findByEmail(email: string) {
		return prisma.user.findUnique({ where: { email } });
	}

	//async findByRg(rg: string) {
	//	return prisma.user.findUnique({ where: { rg } });
	//}

	async findById(id: string) {
		return prisma.user.findUnique({
			where: { id },
			include: { studentProfile: true, teacherProfile: true, adminProfile: true },
		});
	}

	async createWithProfileAndApproval(data: CreateUserInput) {
		return prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					email: data.email,
					full_name: data.full_name,
					//rg: data.rg,
					cpf: data.cpf,
					profileType: data.profileType,
				},
			});

			const resolveSchool = async (schoolIdentifier: string) => {
				const school = await tx.school.findFirst({
					where: {
						OR: [{ id: schoolIdentifier }, { school_name: schoolIdentifier }],
					},
				});

				if (!school) {
					throw new Error('Escola não encontrada');
				}

				return school;
			};

			if (data.profileType === 'STUDENT') {
				await tx.studentProfile.create({
					data: {
						userId: user.id,
						...(data.school ? { schoolId: (await resolveSchool(data.school)).id } : {}),
					},
				});
			} else if (data.profileType === 'TEACHER') {
				await tx.teacherProfile.create({
					data: {
						userId: user.id,
						...(data.school ? { schoolId: (await resolveSchool(data.school)).id } : {}),
					},
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

	async update(id: string, data: UpdateUserInput) {
		return prisma.$transaction(async (tx) => {
			const currentUser = await tx.user.findUnique({ where: { id } });
			if (!currentUser) {
				throw new Error('Usuário não encontrado');
			}

			const profileType = data.profileType ?? currentUser.profileType;

			const user = await tx.user.update({
				where: { id },
				data: {
					email: data.email,
					full_name: data.full_name,
					//rg: data.rg,
					cpf: data.cpf,
					profileType: data.profileType,
				},
			});

			const resolveSchool = async (schoolIdentifier: string) => {
				const school = await tx.school.findFirst({
					where: {
						OR: [{ id: schoolIdentifier }, { school_name: schoolIdentifier }],
					},
				});

				if (!school) {
					throw new Error('Escola não encontrada');
				}

				return school;
			};

			if (profileType !== currentUser.profileType) {
				await tx.studentProfile.deleteMany({ where: { userId: id } });
				await tx.teacherProfile.deleteMany({ where: { userId: id } });
				await tx.adminProfile.deleteMany({ where: { userId: id } });

				if (profileType === 'STUDENT') {
					await tx.studentProfile.create({
						data: {
							userId: id,
							...(data.school ? { schoolId: (await resolveSchool(data.school)).id } : {}),
						},
					});
				} else if (profileType === 'TEACHER') {
					await tx.teacherProfile.create({
						data: {
							userId: id,
							...(data.school ? { schoolId: (await resolveSchool(data.school)).id } : {}),
						},
					});
				} else {
					await tx.adminProfile.create({ data: { userId: id } });
				}
			} else if (data.school !== undefined && profileType === 'STUDENT') {
				const schoolId = data.school ? (await resolveSchool(data.school)).id : null;
				await tx.studentProfile.update({
					where: { userId: id },
					data: { schoolId },
				});
			} else if (data.school !== undefined && profileType === 'TEACHER') {
				const schoolId = data.school ? (await resolveSchool(data.school)).id : null;
				await tx.teacherProfile.update({
					where: { userId: id },
					data: { schoolId },
				});
			}

			return tx.user.findUnique({
				where: { id: user.id },
				include: { studentProfile: true, teacherProfile: true, adminProfile: true },
			});
		});
	}

	async delete(id: string) {
		return prisma.user.delete({ where: { id } });
	}
}