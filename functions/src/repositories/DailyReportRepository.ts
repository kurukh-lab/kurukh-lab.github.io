import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import type { WordOfTheDaySnapshot, DailyStatsSnapshot } from '../types/firestore.types';
import type { IDailyReportRepository } from './interfaces/IDailyReportRepository';

export class DailyReportRepository implements IDailyReportRepository {
  private static readonly COLLECTION = 'daily_reports';
  private static readonly WOTD_DOC = 'word_of_the_day';
  private static readonly STATS_DOC = 'stats';

  constructor(private readonly db: Firestore) { }

  async getWordOfTheDay(): Promise<WordOfTheDaySnapshot | null> {
    const doc = await this.db
      .collection(DailyReportRepository.COLLECTION)
      .doc(DailyReportRepository.WOTD_DOC)
      .get();
    if (!doc.exists) return null;
    return doc.data() as WordOfTheDaySnapshot;
  }

  async saveWordOfTheDay(data: Omit<WordOfTheDaySnapshot, 'generatedAt'>): Promise<void> {
    await this.db
      .collection(DailyReportRepository.COLLECTION)
      .doc(DailyReportRepository.WOTD_DOC)
      .set({ ...data, generatedAt: FieldValue.serverTimestamp() });
  }

  async saveStats(data: Omit<DailyStatsSnapshot, 'generatedAt'>): Promise<void> {
    await this.db
      .collection(DailyReportRepository.COLLECTION)
      .doc(DailyReportRepository.STATS_DOC)
      .set({ ...data, generatedAt: FieldValue.serverTimestamp() });
  }
}
