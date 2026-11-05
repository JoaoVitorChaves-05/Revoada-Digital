export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED';

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAlternativeId: string | null;
  isCorrect: boolean | null;
  answeredAt: string | null; // ISO; Date nao sobrevive ao JSON
  // NAO ha `question`/`subject` aninhado nesta fase (ver Overview do design).
}

export interface AttemptMockExamResumo {
  id: string;
  name: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attempt {
  id: string;
  mockExamId: string;
  status: AttemptStatus;
  startedAt: string; // ISO
  submittedAt: string | null;
  score: number | null;
  correctAnswers: number | null;
  totalQuestions: number | null;
  earnedPoints: number | null;
  answers: AttemptAnswer[];
  mockExam: AttemptMockExamResumo;
  createdAt: string;
  updatedAt: string;
}
