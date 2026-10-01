export type AttemptResult = {
  id: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED';
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  correctAnswers: number | null;
  totalQuestions: number | null;
  earnedPoints: number | null;
};