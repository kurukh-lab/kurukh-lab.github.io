import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { IReportRepository } from '../repositories/interfaces/IReportRepository';
import type { Report } from '../types/firestore.types';
import type { GetWordReportsRequest } from '../types/service.types';

export class ReportsService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly reportRepo: IReportRepository
  ) { }

  async getWordReports(
    uid: string | undefined,
    data: GetWordReportsRequest
  ): Promise<{ reports: Report[] }> {
    if (!uid) throw new Error('Authentication required');
    if (!data.wordId) throw new Error('Word ID is required');

    const isAdmin = await this.userRepo.isAdmin(uid);
    const reports = await this.reportRepo.getReportsByWordId(
      data.wordId,
      isAdmin ? undefined : uid
    );

    return { reports };
  }
}
