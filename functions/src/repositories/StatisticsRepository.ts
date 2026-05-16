import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import type { DailyStatsRecord } from '../types/firestore.types';
import type { IStatisticsRepository } from './interfaces/IStatisticsRepository';

export class StatisticsRepository implements IStatisticsRepository {
  private static readonly COLLECTION = 'statistics';

  constructor(private readonly db: Firestore) {}

  async saveDailyStats(dateString: string, data: DailyStatsRecord): Promise<void> {
    await this.db
      .collection(StatisticsRepository.COLLECTION)
      .doc(dateString)
      .set({ ...data, timestamp: FieldValue.serverTimestamp() });
  }
}
