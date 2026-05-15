import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Word } from '../types';

export const getWordOfTheDay = async (): Promise<Word | null> => {
  try {
    const q = query(
      collection(db, 'words'),
      where('status', '==', 'approved'),
      orderBy('wordOfTheDayPriority', 'desc'),
      limit(1),
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Word;
  } catch (error) {
    console.error('Error fetching word of the day:', error);
    return null;
  }
};

const formatDateHelper = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

export const formatDate = (
  timestamp: Timestamp | Date | { toDate?: () => Date } | null | undefined,
): string => {
  try {
    if (!timestamp) return 'Unknown date';
    if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
      return formatDateHelper(timestamp.toDate());
    }
    return formatDateHelper(timestamp as Date);
  } catch {
    return 'Invalid date';
  }
};
