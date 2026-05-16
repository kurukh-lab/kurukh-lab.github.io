import type { Firestore } from 'firebase-admin/firestore';
import type { HomePageData } from '../types/firestore.types';
import type { IStaticDataRepository } from './interfaces/IStaticDataRepository';

export class StaticDataRepository implements IStaticDataRepository {
  private static readonly COLLECTION = 'static_data';
  private static readonly HOME_PAGE_DOC = 'home-page';

  constructor(private readonly db: Firestore) { }

  async saveHomePageData(data: HomePageData): Promise<void> {
    await this.db
      .collection(StaticDataRepository.COLLECTION)
      .doc(StaticDataRepository.HOME_PAGE_DOC)
      .set(data);
  }
}
