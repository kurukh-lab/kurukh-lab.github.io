import type { IDailyReportRepository } from '../repositories/interfaces/IDailyReportRepository';
import type { WordOfTheDayPipeline, WordOfTheDayPipelineResult } from '../pipelines/WordOfTheDayPipeline';
import type { WordOfTheDayHttpResult } from '../types/service.types';

export class WordOfTheDayService {
  constructor(
    private readonly dailyReportRepo: IDailyReportRepository,
    private readonly wordOfTheDayPipeline: WordOfTheDayPipeline
  ) {}

  async getWordOfTheDay(): Promise<WordOfTheDayHttpResult> {
    const snapshot = await this.dailyReportRepo.getWordOfTheDay();

    if (snapshot) {
      return { wordOfTheDay: snapshot.word, date: snapshot.date };
    }

    // First-run fallback: compute + persist so subsequent reads are O(1)
    console.warn('[wordOfTheDay] snapshot missing; computing on-demand and persisting');
    return this.processWordOfTheDay();
  }

  async processWordOfTheDay(): Promise<WordOfTheDayHttpResult> {
    const result = (await this.wordOfTheDayPipeline.run()) as WordOfTheDayPipelineResult;
    return { wordOfTheDay: result.word, date: result.date };
  }
}
