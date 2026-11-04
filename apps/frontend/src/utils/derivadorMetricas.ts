import type { Attempt, AttemptAnswer } from '../types/attempts.types';
import type {
  MetricasDashboard,
  DiaFrequencia,
} from '../types/dashboard.types';

/**
 * Timestamp efetivo de uma `answer`, usado pelas metricas que dependem de data
 * (streak e frequencia). Ordem de fallback (R8.1, R11.1):
 *   answer.answeredAt -> attempt.submittedAt -> attempt.startedAt.
 * Retorna `null` quando nenhum timestamp datavel existe; nesse caso a answer e
 * descartada da contagem de dias. Concentra o parsing de datas ISO -> Date num
 * unico lugar, facilitando o tratamento de timezone na Fase 2.
 */
function timestampEfetivo(answer: AttemptAnswer, attempt: Attempt): Date | null {
  const candidatos = [answer.answeredAt, attempt.submittedAt, attempt.startedAt];
  for (const iso of candidatos) {
    if (iso == null) continue;
    const data = new Date(iso);
    if (!Number.isNaN(data.getTime())) return data;
  }
  return null;
}

/**
 * Chave do dia local (YYYY-MM-DD no fuso do dispositivo) que identifica o
 * "bucket" de dia de um instante. Concentra a definicao de fronteira de dia num
 * unico ponto para que streak e frequencia (tarefa 4.4) sejam consistentes e a
 * Fase 2 possa trocar o fuso alterando apenas esta funcao.
 */
function chaveDiaLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Total de questoes resolvidas = soma de `answers.length` em todas as
 * tentativas (R5.1). Lista vazia => 0.
 */
export function contarQuestoesResolvidas(attempts: Attempt[]): number {
  return attempts.reduce((total, attempt) => total + attempt.answers.length, 0);
}

/**
 * Taxa de acerto geral em 0..100 (R6.1). Retorna `null` quando nao ha nenhuma
 * `answer`, sinalizando Estado_Vazio em vez de divisao por zero (R6.3).
 * Percentual de answers com `isCorrect === true` sobre o total de answers;
 * `isCorrect === null` conta como nao-acerto no denominador.
 */
export function calcularTaxaAcerto(attempts: Attempt[]): number | null {
  let totalAnswers = 0;
  let acertos = 0;
  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      totalAnswers += 1;
      if (answer.isCorrect === true) acertos += 1;
    }
  }
  if (totalAnswers === 0) return null;
  return (acertos / totalAnswers) * 100;
}

/**
 * Conjunto de chaves de dia local (YYYY-MM-DD) que possuem ao menos uma
 * `answer` com `timestampEfetivo` datavel. Usado por streak e frequencia para
 * saber em quais dias de calendario houve estudo.
 */
function diasComAnswer(attempts: Attempt[]): Set<string> {
  const dias = new Set<string>();
  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const ts = timestampEfetivo(answer, attempt);
      if (ts != null) dias.add(chaveDiaLocal(ts));
    }
  }
  return dias;
}

/** Meia-noite local do dia de `data` (zera hora/min/seg/ms no fuso do dispositivo). */
function inicioDoDiaLocal(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

/** Rotulo curto do dia da semana (ex: "seg"), no fuso do dispositivo. */
function rotuloDiaLocal(data: Date): string {
  const rotulo = data.toLocaleDateString('pt-BR', { weekday: 'short' });
  // Alguns ambientes retornam "seg." ou "seg.-feira"; normaliza para "seg".
  return rotulo.replace(/\.?(-feira)?\.?$/i, '').trim();
}

/**
 * Sequencia (streak) aproximada: dias de calendario consecutivos, terminando em
 * `agora`, com ao menos uma `answer` datavel (via `timestampEfetivo`) (R8.1).
 * Sempre `>= 0`; lista vazia ou sem answers dataveis => 0 (R8.5). Como so conta
 * dias que possuem estudo, satisfaz `0 <= streak <= N`, onde N e a quantidade de
 * dias distintos com estudo (Property 3).
 */
export function calcularStreak(attempts: Attempt[], agora: Date): number {
  const dias = diasComAnswer(attempts);
  if (dias.size === 0) return 0;

  let streak = 0;
  const cursor = inicioDoDiaLocal(agora);
  while (dias.has(chaveDiaLocal(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Exatamente 7 entradas (R11.2), do dia `(agora-6)` ate `agora` em ordem
 * cronologica (R11.1). Cada entrada indica se houve estudo nesse dia
 * (`estudou`) e se e o dia atual (`ehHoje`, apenas o ultimo elemento,
 * correspondente a `agora` - R11.3). Lista vazia => todos `estudou === false`
 * (R11.5). `data`/`rotulo` vem do bucket de dia local.
 */
export function calcularFrequencia7Dias(
  attempts: Attempt[],
  agora: Date,
): DiaFrequencia[] {
  const dias = diasComAnswer(attempts);
  const inicioHoje = inicioDoDiaLocal(agora);

  const frequencia: DiaFrequencia[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const dia = new Date(inicioHoje);
    dia.setDate(dia.getDate() - offset);
    const chave = chaveDiaLocal(dia);
    frequencia.push({
      data: chave,
      rotulo: rotuloDiaLocal(dia),
      estudou: dias.has(chave),
      ehHoje: offset === 0,
    });
  }
  return frequencia;
}

/**
 * Agregador de conveniencia que monta `MetricasDashboard` a partir das funcoes
 * puras acima. `diasComEstudo` e a contagem de entradas com `estudou === true`
 * na janela de 7 dias (0..7), base do resumo "X de 7" (R11.4).
 */
export function derivarMetricas(
  attempts: Attempt[],
  agora: Date,
): MetricasDashboard {
  const frequencia7Dias = calcularFrequencia7Dias(attempts, agora);
  const diasComEstudo = frequencia7Dias.filter((dia) => dia.estudou).length;

  return {
    questoesResolvidas: contarQuestoesResolvidas(attempts),
    taxaAcerto: calcularTaxaAcerto(attempts),
    streakDias: calcularStreak(attempts, agora),
    frequencia7Dias,
    diasComEstudo,
  };
}
