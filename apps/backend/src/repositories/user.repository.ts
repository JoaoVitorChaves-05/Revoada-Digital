import { prisma } from '../lib/prisma';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import type { Prisma } from '@prisma/client';

async function findSchoolId(tx: Prisma.TransactionClient, schoolName: string | undefined) {
	if (!schoolName) {
		throw new Error('Escola é obrigatória para este perfil');
	}

	const school = await tx.school.findUnique({
		where: { school_name: schoolName },
		select: { id: true },
	});

	if (!school) {
		throw new Error('Escola não cadastrada');
	}

	return school.id;
}

export class UserRepository {
	async findByEmail(email: string) {
		return prisma.user.findUnique({ where: { email } });
	}

	async findByRg(rg: string) {
		return prisma.user.findUnique({ where: { rg } });
	}

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
					password: data.password,
					full_name: data.full_name,
					rg: data.rg,
					cpf: data.cpf,
					profileType: data.profileType,
				},
			});

			if (data.profileType === 'STUDENT') {
				const schoolId = await findSchoolId(tx, data.school);
				await tx.studentProfile.create({
					data: { userId: user.id, schoolId },
				});
			} else if (data.profileType === 'TEACHER') {
				const schoolId = await findSchoolId(tx, data.school);
				await tx.teacherProfile.create({
					data: { userId: user.id, schoolId },
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
					rg: data.rg,
					cpf: data.cpf,
					profileType: data.profileType,
				},
			});

			if (profileType !== currentUser.profileType) {
				await tx.studentProfile.deleteMany({ where: { userId: id } });
				await tx.teacherProfile.deleteMany({ where: { userId: id } });
				await tx.adminProfile.deleteMany({ where: { userId: id } });

				if (profileType === 'STUDENT') {
					const schoolId = await findSchoolId(tx, data.school);
					await tx.studentProfile.create({ data: { userId: id, schoolId } });
				} else if (profileType === 'TEACHER') {
					const schoolId = await findSchoolId(tx, data.school);
					await tx.teacherProfile.create({ data: { userId: id, schoolId } });
				} else {
					await tx.adminProfile.create({ data: { userId: id } });
				}
			} else if (data.school && profileType === 'STUDENT') {
				const schoolId = await findSchoolId(tx, data.school);
				await tx.studentProfile.update({ where: { userId: id }, data: { schoolId } });
			} else if (data.school && profileType === 'TEACHER') {
				const schoolId = await findSchoolId(tx, data.school);
				await tx.teacherProfile.update({ where: { userId: id }, data: { schoolId } });
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