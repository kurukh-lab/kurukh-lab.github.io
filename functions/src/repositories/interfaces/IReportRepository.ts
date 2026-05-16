import type { Report } from '../../types/firestore.types';

export interface ResolveReportData {
  resolution: string;
  actionTaken: string;
  resolvedBy: string;
}

export interface IReportRepository {
  getReportsByWordId(wordId: string, uid?: string): Promise<Report[]>;
  getReportById(reportId: string): Promise<Report | null>;
  resolveReport(reportId: string, data: ResolveReportData): Promise<void>;
}
