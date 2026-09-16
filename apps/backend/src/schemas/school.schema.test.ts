import { describe, expect, it } from 'vitest';
import { createSchoolSchema } from './school.schema';

const baseSchool = {
  school_name: 'Escola Exemplo',
  school_city: 'Cidade Exemplo',
}

describe('createSchoolSchema', () => {
	it('aceita escola com nome e cidade válidos', () => {
		const result = createSchoolSchema.safeParse(baseSchool);

		expect(result.success).toBe(true);
	});

	it('rejeita escola sem nome', () => {
		const result = createSchoolSchema.safeParse({
			...baseSchool,
			school_name: '    ',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita escola sem cidade', () => {
		const result = createSchoolSchema.safeParse({
			...baseSchool,
			school_city: '    ',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita campos que não sejam strings', () => {
		const result = createSchoolSchema.safeParse({
			school_name: 123,
			school_city: true,
		});

		expect(result.success).toBe(false);
	});
});
