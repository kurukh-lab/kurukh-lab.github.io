import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { IWordRepository } from '../repositories/interfaces/IWordRepository';
import type { IReportRepository } from '../repositories/interfaces/IReportRepository';
import type { ReviewWordRequest, ResolveReportRequest } from '../types/service.types';

export class AdminService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly wordRepo: IWordRepository,
    private readonly reportRepo: IReportRepository
  ) {}

  async reviewWord(
    uid: string | undefined,
    data: ReviewWordRequest
  ): Promise<{ message: string }> {
    await this.ensureAdmin(uid);

    if (!data.wordId) throw new Error('Word ID is required');

    const word = await this.wordRepo.getWordById(data.wordId);
    if (!word) throw new Error('Word not found');

    const status = data.isApproved ? 'approved' : ('rejected' as const);
    await this.wordRepo.updateWordStatus(
      data.wordId,
      status,
      uid as string,
      data.isApproved ? null : (data.rejectionReason ?? 'No reason provided')
    );

    return { message: `Word ${data.wordId} has been ${status}` };
  }

  async resolveReport(
    uid: string | undefined,
    data: ResolveReportRequest
  ): Promise<{ message: string }> {
    await this.ensureAdmin(uid);

    if (!data.reportId) throw new Error('Report ID is required');

    const report = await this.reportRepo.getReportById(data.reportId);
    if (!report) throw new Error('Report not found');

    await this.reportRepo.resolveReport(data.reportId, {
      resolution: data.resolution,
      actionTaken: data.actionTaken,
      resolvedBy: uid as string,
    });

    return { message: `Report ${data.reportId} has been resolved` };
  }

  private async ensureAdmin(uid: string | undefined): Promise<void> {
    if (!uid) throw new Error('Authentication required');
    const ok = await this.userRepo.isAdmin(uid);
    if (!ok) throw new Error('Admin access required');
  }
}
