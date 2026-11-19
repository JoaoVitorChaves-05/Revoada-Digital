import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardRepository } from '../repositories/dashboard.repository';
import type { SchoolRepository } from '../repositories/school.repository';
import {
  agregarPorArea,
  AREAS_ENEM,
  DashboardService,
  StudentNotFoundError,
  type AnswerComQuestao,
} from './dashboard.service';

vi.mock('../repositories/dashboard.repository', () => ({
  DashboardRepository: class {},
}));

vi.mock('../repositories/school.repository', () => ({
  SchoolRepository: class {},
}));

function answer(
  subject: string[],
  difficulty: number,
  isCorrect: boolean | null,
): AnswerComQuestao {
  return { isCorrect, question: { subject, difficulty } };
}

describe('agregarPorArea', () => {
  it('sempre retorna as 4 áreas do ENEM, zeradas, para uma lista vazia', () => {
    const result = agregarPorArea([]);

    expect(result.map((a) => a.area)).toEqual([...AREAS_ENEM]);
    for (const area of result) {
      expect(area.questoesResolvidas).toBe(0);
      expect(area.taxaAcerto).toBe(0);
      expect(area.porDificuldade).toEqual([
        { nivel: 'Fáceis', taxaAcerto: 0 },
        { nivel: 'Médias', taxaAcerto: 0 },
        { nivel: 'Difíceis', taxaAcerto: 0 },
      ]);
    }
  });

  it('agrega respostas de uma única área e arredonda a taxa de acerto', () => {
    const result = agregarPorArea([
      answer(['Matemática'], 0, true),
      answer(['Matemática'], 2, true),
      answer(['Matemática'], 3, false),
    ]);

    const matematica = result.find((a) => a.area === 'Matemática')!;
    expect(matematica.questoesResolvidas).toBe(3);
    // 2 de 3 acertos => 67 (arredondado)
    expect(matematica.taxaAcerto).toBe(67);

    // As demais áreas permanecem zeradas.
    for (const area of result.filter((a) => a.area !== 'Matemática')) {
      expect(area.questoesResolvidas).toBe(0);
    }
  });

  it('conta questão interdisciplinar para cada área correspondente', () => {
    const result = agregarPorArea([
      answer(['História', 'Geografia'], 2, true),
    ]);

    const humanas = result.find((a) => a.area === 'Ciências Humanas')!;
    // Mesmo subject com dois itens da mesma área conta uma vez por questão.
    expect(humanas.questoesResolvidas).toBe(1);

    // Uma questão que cruza áreas distintas conta em ambas.
    const cruzada = agregarPorArea([
      answer(['Matemática', 'Física'], 1, true),
    ]);
    expect(
      cruzada.find((a) => a.area === 'Matemática')!.questoesResolvidas,
    ).toBe(1);
    expect(
      cruzada.find((a) => a.area === 'Ciências da Natureza')!
        .questoesResolvidas,
    ).toBe(1);
  });

  it('mapeia difficulty 0..3 para Fáceis/Médias/Difíceis', () => {
    const result = agregarPorArea([
      answer(['Biologia'], 0, true), // Fáceis
      answer(['Biologia'], 1, false), // Fáceis
      answer(['Biologia'], 2, true), // Médias
      answer(['Biologia'], 3, false), // Difíceis
    ]);

    const natureza = result.find(
      (a) => a.area === 'Ciências da Natureza',
    )!;
    const faixa = (nivel: string) =>
      natureza.porDificuldade.find((f) => f.nivel === nivel)!.taxaAcerto;

    expect(faixa('Fáceis')).toBe(50); // 1 de 2
    expect(faixa('Médias')).toBe(100); // 1 de 1
    expect(faixa('Difíceis')).toBe(0); // 0 de 1
  });

  it('trata isCorrect null como não-acerto', () => {
    const result = agregarPorArea([
      answer(['Matemática'], 1, null),
      answer(['Matemática'], 1, true),
    ]);

    const matematica = result.find((a) => a.area === 'Matemática')!;
    expect(matematica.questoesResolvidas).toBe(2);
    expect(matematica.taxaAcerto).toBe(50); // 1 de 2
  });

  it('ignora matérias desconhecidas sem quebrar as áreas', () => {
    const result = agregarPorArea([
      answer(['Materia Inexistente'], 1, true),
    ]);

    // Nenhuma área recebe a resposta, mas as 4 áreas continuam presentes.
    expect(result).toHaveLength(4);
    expect(
      result.every((a) => a.questoesResolvidas === 0),
    ).toBe(true);
  });
});

describe('DashboardService.getDesempenhoAreas', () => {
  let dashboardRepository: {
    findStudentByUserId: ReturnType<typeof vi.fn>;
    findAnswersComQuestaoByStudent: ReturnType<typeof vi.fn>;
  };
  let service: DashboardService;

  beforeEach(() => {
    dashboardRepository = {
      findStudentByUserId: vi.fn(),
      findAnswersComQuestaoByStudent: vi.fn(),
    };
    service = new DashboardService(
      dashboardRepository as unknown as DashboardRepository,
      {} as unknown as SchoolRepository,
    );
  });

  it('resolve o aluno pelo userId e agrega suas respostas por área', async () => {
    dashboardRepository.findStudentByUserId.mockResolvedValue({
      id: 'student-1',
      points: 0,
      schoolId: 'school-1',
    });
    dashboardRepository.findAnswersComQuestaoByStudent.mockResolvedValue([
      answer(['Matemática'], 1, true),
    ]);

    const result = await service.getDesempenhoAreas('user-1');

    expect(dashboardRepository.findStudentByUserId).toHaveBeenCalledWith(
      'user-1',
    );
    expect(
      dashboardRepository.findAnswersComQuestaoByStudent,
    ).toHaveBeenCalledWith('student-1');
    expect(result).toHaveLength(4);
    expect(
      result.find((a) => a.area === 'Matemática')!.questoesResolvidas,
    ).toBe(1);
  });

  it('lança StudentNotFoundError quando o aluno não existe', async () => {
    dashboardRepository.findStudentByUserId.mockResolvedValue(null);

    await expect(
      service.getDesempenhoAreas('user-1'),
    ).rejects.toBeInstanceOf(StudentNotFoundError);

    expect(
      dashboardRepository.findAnswersComQuestaoByStudent,
    ).not.toHaveBeenCalled();
  });
});