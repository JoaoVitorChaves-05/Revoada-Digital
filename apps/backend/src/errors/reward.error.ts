export type RewardErrorCode =
  | 'STUDENT_NOT_FOUND'
  | 'REWARD_NOT_FOUND'
  | 'REWARD_INACTIVE'
  | 'OUT_OF_STOCK'
  | 'INSUFFICIENT_POINTS'
  | 'REWARD_CHANGED';

export class RewardError extends Error {
  constructor(
    readonly code: RewardErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'RewardError';
  }
}
