import type { IWordRepository } from '../repositories/interfaces/IWordRepository';
import type { IStaticDataRepository } from '../repositories/interfaces/IStaticDataRepository';
import type { IDateProvider } from '../utils/dateUtils';
import type { HomePageUpdateResult } from '../types/service.types';

export class HomePageDataService {
  constructor(
    private readonly wordRepo: IWordRepository,
    private readonly staticDataRepo: IStaticDataRepository,
    private readonly dateProvider: IDateProvider
  ) {}

  async updateHomePageData(): Promise<HomePageUpdateResult> {
    try {
      console.log('Starting home page data update...');

      const today = this.dateProvider.now();
      today.setUTCHours(0, 0, 0, 0);
      const dateString = today.toISOString().split('T')[0];
      const seed = HomePageDataService.seedFromDateUTC(dateString);

      console.log('Fetching recent words and all approved words...');
      const [recentWords, allApprovedWords] = await Promise.all([
        this.wordRepo.getRecentApprovedWords(6),
        this.wordRepo.getApprovedWords(),
      ]);

      console.log(`Found ${recentWords.length} recent words`);

      const wordOfTheDay =
        allApprovedWords.length > 0
          ? allApprovedWords[seed % allApprovedWords.length]
          : null;

      console.log('Word of the day selected:', wordOfTheDay?.kurukh_word);

      await this.staticDataRepo.saveHomePageData({
        recentWords,
        wordOfTheDay: wordOfTheDay ?? null,
        lastUpdated: new Date(),
        generatedAt: new Date().toISOString(),
        date: dateString,
      });

      console.log('Home page data update completed successfully');

      return {
        success: true,
        message: 'Home page data updated successfully',
        data: {
          recentWordsCount: recentWords.length,
          wordOfTheDay: wordOfTheDay?.kurukh_word,
          wordOfTheDayId: wordOfTheDay?.id,
          date: dateString,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error updating home page data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // UTC-based seed intentionally different from IST-based WordOfTheDayPipeline seed
  private static seedFromDateUTC(dateString: string): number {
    return Array.from(dateString).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  }
}
