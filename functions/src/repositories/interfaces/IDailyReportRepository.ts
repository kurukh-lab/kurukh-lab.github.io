import type { WordOfTheDaySnapshot, DailyStatsSnapshot } from '../../types/firestore.types';

export interface IDailyReportRepository {
  getWordOfTheDay(): Promise<WordOfTheDaySnapshot | null>;
  saveWordOfTheDay(data: Omit<WordOfTheDaySnapshot, 'generatedAt'>): Promise<void>;
  saveStats(data: Omit<DailyStatsSnapshot, 'generatedAt'>): Promise<void>;
}
