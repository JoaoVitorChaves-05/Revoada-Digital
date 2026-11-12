// Script de teste: cria dois estudantes aprovados para testar o chat.
//
// O fluxo usa os services do projeto:
//  - garante uma escola de teste (STUDENT exige escola existente);
//  - cria cada estudante via userService.createUser (aplica hash bcrypt,
//    cria o studentProfile e uma approvalRequest PENDING);
//  - aprova cada approvalRequest.
//
// Dados são FICTÍCIOS e destinados a teste. Idempotente: se um email/RG/CPF
// já existir, o estudante correspondente é pulado (o service lança e tratamos).
//
// Uso (a partir de apps/backend):
//   npx tsx src/scripts/seed-chat-students.ts
import { prisma } from '../lib/prisma';
import { userService } from '../services/user.service';
import { SchoolRepository } from '../repositories/school.repository';

const SCHOOL_NAME = 'Escola de Teste do Chat';
const SCHOOL_CITY = 'Cidade Teste';

// Estudantes fictícios para teste do chat.
const students = [
	{
		email: 'aluno.teste1@example.com',
		password: 'teste123',
		full_name: 'Aluno Teste Um',
		rg: '200000001',
		cpf: '20000000101',
		year: 1,
	},
	{
		email: 'aluno.teste2@example.com',
		password: 'teste123',
		full_name: 'Aluno Teste Dois',
		rg: '200000002',
		cpf: '20000000202',
		year: 2,
	},
];

async function ensureSchool() {
	const repo = new SchoolRepository();
	const existing = await repo.findByName(SCHOOL_NAME);
	if (existing) {
		console.log('escola já existe:', SCHOOL_NAME);
		return existing;
	}
	const { school } = await repo.createWithProfile({
		school_name: SCHOOL_NAME,
		school_city: SCHOOL_CITY,
	});
	console.log('escola criada:', school.school_name, '(id:', school.id + ')');
	return school;
}

async function createAndApprove(student: (typeof students)[number]) {
	try {
		const created = await userService.createUser({
			email: student.email,
			password: student.password,
			full_name: student.full_name,
			rg: student.rg,
			cpf: student.cpf,
			profileType: 'STUDENT',
			school: SCHOOL_NAME,
			year: student.year,
		});

		await prisma.approvalRequest.update({
			where: { id: created.approvalRequest.id },
			data: { status: 'APPROVED', rejectionReason: null },
		});

		console.log('estudante criado e aprovado:', {
			id: created.user.id,
			email: created.user.email,
			senha: student.password, // credencial de teste, exibida só para facilitar o login manual
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.warn(`pulando ${student.email}: ${message}`);
	}
}

async function main() {
	await ensureSchool();
	for (const student of students) {
		await createAndApprove(student);
	}
	console.log('\nConcluído. Use os emails acima (senha teste123) para logar e abrir o chat entre eles.');
}

main()
	.then(async () => {
		await prisma.$disconnect();
		process.exit(0);
	})
	.catch(async (error) => {
		console.error('Falha no seed de estudantes:', error instanceof Error ? error.message : error);
		await prisma.$disconnect();
		process.exit(1);
	});
