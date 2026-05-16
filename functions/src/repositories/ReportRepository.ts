import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import type { Report } from '../types/firestore.types';
import type { IReportRepository, ResolveReportData } from './interfaces/IReportRepository';

export class ReportRepository implements IReportRepository {
  private static readonly COLLECTION = 'reports';

  constructor(private readonly db: Firestore) { }

  async getReportsByWordId(wordId: string, uid?: string): Promise<Report[]> {
    let query = this.db
      .collection(ReportRepository.COLLECTION)
      .where('word_id', '==', wordId);

    if (uid !== undefined) {
      query = query.where('user_id', '==', uid);
    }

    const snap = await query.get();
    return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Report, 'id'>) }));
  }

  async getReportById(reportId: string): Promise<Report | null> {
    const doc = await this.db.collection(ReportRepository.COLLECTION).doc(reportId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Omit<Report, 'id'>) };
  }

  async resolveReport(reportId: string, data: ResolveReportData): Promise<void> {
    await this.db.collection(ReportRepository.COLLECTION).doc(reportId).update({
      status: 'resolved',
      resolution: data.resolution,
      action_taken: data.actionTaken,
      resolved_by: data.resolvedBy,
      resolved_at: FieldValue.serverTimestamp(),
    });
  }
}
