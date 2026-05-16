import type { IWordRepository } from '../repositories/interfaces/IWordRepository';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { IStatisticsRepository } from '../repositories/interfaces/IStatisticsRepository';
import type { IDateProvider } from '../utils/dateUtils';
import type { DictionaryStatsResult } from '../types/service.types';

export class StatsService {
  constructor(
    private readonly wordRepo: IWordRepository,
    private readonly userRepo: IUserRepository,
    private readonly statsRepo: IStatisticsRepository,
    private readonly dateProvider: IDateProvider
  ) {}

  async getDictionaryStats(): Promise<DictionaryStatsResult> {
    const [totalApprovedWords, totalPendingWords, totalUsers] = await Promise.all([
      this.wordRepo.countApprovedWords(),
      this.wordRepo.countPendingWords(),
      this.userRepo.countUsers(),
    ]);

    return {
      totalApprovedWords,
      totalPendingWords,
      totalUsers,
      lastUpdated: new Date().toISOString(),
    };
  }

  async updateDailyStats(): Promise<void> {
    const now = this.dateProvider.now();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const dateString = startOfDay.toISOString().split('T')[0];

    const [userCount, approvedWordCount, dailyContributionCount] = await Promise.all([
      this.userRepo.countUsers(),
      this.wordRepo.countApprovedWords(),
      this.wordRepo.countDailyContributions(startOfDay, endOfDay),
    ]);

    await this.statsRepo.saveDailyStats(dateString, {
      date: dateString,
      userCount,
      approvedWordCount,
      dailyContributionCount,
    });

    console.log(`Statistics for ${dateString} updated successfully`);
  }
}
