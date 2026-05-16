import type { Word } from '../types/firestore.types';
import type { IWordRepository } from '../repositories/interfaces/IWordRepository';
import type { IDailyReportRepository } from '../repositories/interfaces/IDailyReportRepository';
import type { IDateProvider } from '../utils/dateUtils';
import type { IPipeline } from './IPipeline';

export interface WordOfTheDayPipelineResult {
  success: boolean;
  word: Word | null;
  date: string;
}

export class WordOfTheDayPipeline implements IPipeline {
  readonly name = 'word_of_the_day';

  constructor(
    private readonly wordRepo: IWordRepository,
    private readonly dailyReportRepo: IDailyReportRepository,
    private readonly dateProvider: IDateProvider
  ) { }

  async run(): Promise<WordOfTheDayPipelineResult> {
    const dateString = this.dateProvider.istDateString();
    console.log(`[wordOfTheDay] processing for ${dateString} IST`);

    const approvedWords = await this.wordRepo.getApprovedWords();

    if (approvedWords.length === 0) {
      console.warn('[wordOfTheDay] no approved words; writing empty snapshot');
      await this.dailyReportRepo.saveWordOfTheDay({
        word: null,
        date: dateString,
        generatedAtUTC: new Date().toISOString(),
      });
      return { success: true, word: null, date: dateString };
    }

    const word = WordOfTheDayPipeline.selectWordForDate(approvedWords, dateString);

    await this.dailyReportRepo.saveWordOfTheDay({
      word,
      date: dateString,
      generatedAtUTC: new Date().toISOString(),
    });

    console.log(`[wordOfTheDay] wrote ${word?.kurukh_word} for ${dateString}`);
    return { success: true, word, date: dateString };
  }

  private static seedFromDate(dateString: string): number {
    let total = 0;
    for (let i = 0; i < dateString.length; i++) {
      total += dateString.charCodeAt(i);
    }
    return total;
  }

  private static selectWordForDate(words: Word[], dateString: string): Word | null {
    if (words.length === 0) return null;
    const seed = WordOfTheDayPipeline.seedFromDate(dateString);
    return words[seed % words.length];
  }
}
