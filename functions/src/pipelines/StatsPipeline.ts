import type { Word, DailyStatsSnapshot, Meaning } from '../types/firestore.types';
import type { IWordRepository } from '../repositories/interfaces/IWordRepository';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { IDailyReportRepository } from '../repositories/interfaces/IDailyReportRepository';
import type { IDateProvider } from '../utils/dateUtils';
import type { IPipeline } from './IPipeline';

export interface StatsPipelineResult {
  success: boolean;
  stats: Omit<DailyStatsSnapshot, 'generatedAt'>;
}

export class StatsPipeline implements IPipeline {
  readonly name = 'stats';

  constructor(
    private readonly wordRepo: IWordRepository,
    private readonly userRepo: IUserRepository,
    private readonly dailyReportRepo: IDailyReportRepository,
    private readonly dateProvider: IDateProvider
  ) { }

  async run(): Promise<StatsPipelineResult> {
    const dateString = this.dateProvider.istDateString();
    console.log(`[stats] processing for ${dateString} IST`);

    const [approvedWords, totalUsers] = await Promise.all([
      this.wordRepo.getApprovedWords(),
      this.userRepo.countUsers(),
    ]);

    const totalWords = approvedWords.length;
    const totalContributors = new Set(
      approvedWords.map((d) => d.contributor_id).filter((id): id is string => Boolean(id))
    ).size;
    const totalAudio = StatsPipeline.countAudio(approvedWords);
    const regionSet = StatsPipeline.computeRegions(approvedWords);

    const stats: Omit<DailyStatsSnapshot, 'generatedAt'> = {
      totalWords,
      totalAudio,
      totalContributors,
      totalRegions: regionSet.size,
      totalUsers,
      date: dateString,
      generatedAtUTC: new Date().toISOString(),
    };

    await this.dailyReportRepo.saveStats(stats);

    console.log(
      `[stats] wrote words=${totalWords} contributors=${totalContributors} audio=${totalAudio} regions=${regionSet.size} for ${dateString}`
    );

    return { success: true, stats };
  }

  private static countAudio(words: Word[]): number {
    return words.filter((d) => {
      if (d.audio_url || d.pronunciation_audio_url) return true;
      return (d.meanings ?? []).some(
        (m: Meaning) => m && (m.audio_url || m.audio)
      );
    }).length;
  }

  private static computeRegions(words: Word[]): Set<string> {
    const regionSet = new Set<string>();
    for (const doc of words) {
      if (doc.dialect) regionSet.add(doc.dialect);
      if (doc.region) regionSet.add(doc.region);
      for (const meaning of doc.meanings ?? []) {
        if (meaning?.dialect) regionSet.add(meaning.dialect);
        if (meaning?.region) regionSet.add(meaning.region);
      }
    }
    return regionSet;
  }
}
