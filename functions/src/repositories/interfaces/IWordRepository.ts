import type { Word, WordStatus } from '../../types/firestore.types';

export interface IWordRepository {
  getApprovedWords(): Promise<Word[]>;
  getWordById(wordId: string): Promise<Word | null>;
  updateWordStatus(
    wordId: string,
    status: WordStatus,
    reviewedBy: string,
    rejectionReason?: string | null
  ): Promise<void>;
  getRecentApprovedWords(limit: number): Promise<Word[]>;
  countApprovedWords(): Promise<number>;
  countPendingWords(): Promise<number>;
  countDailyContributions(startOfDay: Date, endOfDay: Date): Promise<number>;
}
