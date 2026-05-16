import type { HomePageData } from '../../types/firestore.types';

export interface IStaticDataRepository {
  saveHomePageData(data: HomePageData): Promise<void>;
}
