import type { DailyStatsRecord } from '../../types/firestore.types';

export interface IStatisticsRepository {
  saveDailyStats(dateString: string, data: DailyStatsRecord): Promise<void>;
}
