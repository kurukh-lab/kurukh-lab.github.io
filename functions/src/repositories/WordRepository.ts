import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import type { Word, WordStatus } from '../types/firestore.types';
import type { IWordRepository } from './interfaces/IWordRepository';

export class WordRepository implements IWordRepository {
  private static readonly COLLECTION = 'words';

  constructor(private readonly db: Firestore) { }

  async getApprovedWords(): Promise<Word[]> {
    const snap = await this.db
      .collection(WordRepository.COLLECTION)
      .where('status', '==', 'approved')
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Word, 'id'>) }));
  }

  async getWordById(wordId: string): Promise<Word | null> {
    const doc = await this.db.collection(WordRepository.COLLECTION).doc(wordId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Omit<Word, 'id'>) };
  }

  async updateWordStatus(
    wordId: string,
    status: WordStatus,
    reviewedBy: string,
    rejectionReason?: string | null
  ): Promise<void> {
    await this.db.collection(WordRepository.COLLECTION).doc(wordId).update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
      reviewed_by: reviewedBy,
      rejection_reason: rejectionReason ?? null,
    });
  }

  async getRecentApprovedWords(limit: number): Promise<Word[]> {
    const snap = await this.db
      .collection(WordRepository.COLLECTION)
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Word, 'id'>) }));
  }

  async countApprovedWords(): Promise<number> {
    const snap = await this.db
      .collection(WordRepository.COLLECTION)
      .where('status', '==', 'approved')
      .count()
      .get();
    return snap.data().count;
  }

  async countPendingWords(): Promise<number> {
    const snap = await this.db
      .collection(WordRepository.COLLECTION)
      .where('status', '==', 'pending_review')
      .count()
      .get();
    return snap.data().count;
  }

  async countDailyContributions(startOfDay: Date, endOfDay: Date): Promise<number> {
    const snap = await this.db
      .collection(WordRepository.COLLECTION)
      .where('createdAt', '>=', Timestamp.fromDate(startOfDay))
      .where('createdAt', '<', Timestamp.fromDate(endOfDay))
      .count()
      .get();
    return snap.data().count;
  }
}
