/**
 * Dictionary service — Firestore-backed reads and writes for /words,
 * /reports, /corrections + the Cloud-Function-fronted admin actions.
 *
 * NOTE on architecture (flagged in PLAN.md for Phase 3 refactor):
 *  - This module mixes data access, business rules, and orchestration.
 *  - `applyCorrection` writes directly to /words from the client; under the
 *    tightened Firestore rules in this branch, only admins can call it.
 *    The community-driven apply path must move into a Cloud Function.
 *
 * The TS migration preserves behaviour 1:1; the refactor is intentionally
 * deferred to a later PR so this change stays reviewable.
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  serverTimestamp,
  limit,
  updateDoc,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type {
  Correction,
  CorrectionType,
  SearchOptions,
  ServiceResult,
  Word,
  WordStatus,
  WordVoteRecord,
} from '../types';

const wordsCollection = collection(db, 'words');
const reportsCollection = collection(db, 'reports');

const getAnonymousUserId = (): string => {
  let anonymousId = localStorage.getItem('kurukh_anonymous_id');
  if (!anonymousId) {
    anonymousId =
      'anon_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('kurukh_anonymous_id', anonymousId);
  }
  return anonymousId;
};

// ─── Likes ──────────────────────────────────────────────────────────────

export interface LikeToggleResult {
  success: boolean;
  liked?: boolean;
  newCount?: number;
  error?: string;
}

export const toggleWordLike = async (
  wordId: string,
  userId: string | null = null,
): Promise<LikeToggleResult> => {
  try {
    const effectiveUserId = userId || getAnonymousUserId();
    const wordRef = doc(db, 'words', wordId);
    const wordDoc = await getDoc(wordRef);
    if (!wordDoc.exists()) throw new Error('Word not found');

    const wordData = wordDoc.data() as DocumentData;
    const currentLikes: string[] = wordData.likedBy || [];
    const currentLikesCount: number = wordData.likesCount || 0;

    const hasLiked = currentLikes.includes(effectiveUserId);
    const updatedLikes = hasLiked
      ? currentLikes.filter((id) => id !== effectiveUserId)
      : [...currentLikes, effectiveUserId];
    const updatedCount = hasLiked
      ? Math.max(0, currentLikesCount - 1)
      : currentLikesCount + 1;

    await updateDoc(wordRef, {
      likedBy: updatedLikes,
      likesCount: updatedCount,
      updatedAt: serverTimestamp(),
    });

    return { success: true, liked: !hasLiked, newCount: updatedCount };
  } catch (error) {
    console.error('Error toggling word like:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const hasUserLikedWord = async (
  wordId: string,
  userId: string | null = null,
): Promise<boolean> => {
  try {
    const effectiveUserId = userId || getAnonymousUserId();
    const wordDoc = await getDoc(doc(db, 'words', wordId));
    if (!wordDoc.exists()) return false;
    const data = wordDoc.data() as DocumentData;
    return (data.likedBy || []).includes(effectiveUserId);
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

export const getWordLikeCount = async (wordId: string): Promise<number> => {
  try {
    const wordDoc = await getDoc(doc(db, 'words', wordId));
    if (!wordDoc.exists()) return 0;
    return (wordDoc.data() as DocumentData).likesCount || 0;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
};

// ─── Search & lookup ────────────────────────────────────────────────────

export const searchWords = async (
  term: string,
  options: SearchOptions = {},
): Promise<Word[]> => {
  try {
    const processedTerm = term.toLowerCase().trim();
    const baseQuery = query(wordsCollection, where('status', '==', 'approved'));
    const querySnapshot = await getDocs(baseQuery);
    let words: Word[] = [];

    querySnapshot.forEach((d) => {
      const wordData = { id: d.id, ...d.data() } as Word;
      const kurukhWord = wordData.kurukh_word?.toLowerCase() || '';
      if (kurukhWord.includes(processedTerm)) {
        words.push(wordData);
      }
    });

    words.sort((a, b) => {
      const aWord = a.kurukh_word?.toLowerCase() || '';
      const bWord = b.kurukh_word?.toLowerCase() || '';
      const aStartsWith = aWord.startsWith(processedTerm);
      const bStartsWith = bWord.startsWith(processedTerm);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return aWord.localeCompare(bWord);
    });

    if (options.language) {
      words = words.filter((w) =>
        w.meanings?.some((m) => m.language === options.language),
      );
    }
    if (options.partOfSpeech) {
      words = words.filter((w) => w.part_of_speech === options.partOfSpeech);
    }

    return words;
  } catch (error) {
    console.error('❌ Error searching words:', error);
    throw error;
  }
};

export const getWordById = async (id: string): Promise<Word | null> => {
  try {
    const wordDoc = await getDoc(doc(db, 'words', id));
    if (!wordDoc.exists()) return null;
    return { id: wordDoc.id, ...wordDoc.data() } as Word;
  } catch (error) {
    console.error('Error getting word:', error);
    throw error;
  }
};

// ─── Contributions ──────────────────────────────────────────────────────

export interface AddWordInput {
  kurukh_word: string;
  meanings: Word['meanings'];
  part_of_speech?: string;
  pronunciation_guide?: string;
}

export interface AddWordResult {
  success: boolean;
  id?: string;
  error?: string;
}

export const addWord = async (
  wordData: AddWordInput,
  userId: string,
): Promise<AddWordResult> => {
  try {
    if (!userId) throw new Error('User must be authenticated to contribute');
    if (auth.currentUser === null) {
      throw new Error('Firebase Auth user not found. Please log in again.');
    }
    try {
      await auth.currentUser.getIdToken(true);
    } catch (tokenError) {
      console.warn('⚠️ Token refresh failed:', tokenError);
    }

    const wordWithMeta = {
      ...wordData,
      contributor_id: userId,
      status: 'community_review' as const,
      community_votes_for: 0,
      community_votes_against: 0,
      reviewed_by: [],
      likedBy: [],
      likesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(wordsCollection, wordWithMeta);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding word:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getUserContributions = async (userId: string): Promise<Word[]> => {
  try {
    const q = query(
      wordsCollection,
      where('contributor_id', '==', userId),
      orderBy('createdAt', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    const contributions: Word[] = [];
    querySnapshot.forEach((d) => {
      contributions.push({ id: d.id, ...d.data() } as Word);
    });
    return contributions;
  } catch (error) {
    console.error('Error getting user contributions:', error);
    throw error;
  }
};

export const getRecentWords = async (count = 5): Promise<Word[]> => {
  try {
    const q = query(
      wordsCollection,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(count),
    );
    const querySnapshot = await getDocs(q);
    const words: Word[] = [];
    querySnapshot.forEach((d) => {
      words.push({ id: d.id, ...d.data() } as Word);
    });
    return words;
  } catch (error) {
    console.error('Error getting recent words:', error);
    return [];
  }
};

// ─── Reports ────────────────────────────────────────────────────────────

export const reportWord = async (
  wordId: string,
  userId: string,
  reason: string,
  details: string,
): Promise<ServiceResult & { id?: string }> => {
  try {
    const reportData = {
      word_id: wordId,
      user_id: userId,
      reason,
      details,
      status: 'open' as const,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(reportsCollection, reportData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error reporting word:', error);
    return { success: false, error: (error as Error).message };
  }
};

// ─── Cloud Function bridges (stats, word-of-day, admin) ────────────────

export interface DictionaryStats {
  totalApprovedWords: number;
  totalPendingWords: number;
  totalUsers: number;
  lastUpdated: string;
}

const functionsBaseUrl = (fnName: string): string =>
  import.meta.env.DEV
    ? `http://localhost:5011/kurukh-dictionary/us-central1/${fnName}`
    : `https://us-central1-kurukh-dictionary.cloudfunctions.net/${fnName}`;

const fallbackStats = (): DictionaryStats => ({
  totalApprovedWords: 0,
  totalPendingWords: 0,
  totalUsers: 0,
  lastUpdated: new Date().toISOString(),
});

export const getDictionaryStats = async (): Promise<DictionaryStats> => {
  try {
    const response = await fetch(functionsBaseUrl('getDictionaryStats'));
    const data = await response.json();
    if (data.success) return data.stats as DictionaryStats;
    console.error('Error getting dictionary stats:', data.error);
    return fallbackStats();
  } catch (error) {
    console.error('Error fetching dictionary stats:', error);
    return fallbackStats();
  }
};

/**
 * Home-page hero stats produced by the `statsPipeline` running inside the
 * dailySchedule orchestrator at 00:00 IST. Fields default to 0 when the
 * snapshot doc is missing so the UI can render without conditional checks.
 */
export interface DailyStats {
  totalWords: number;
  totalAudio: number;
  totalContributors: number;
  totalRegions: number;
  totalUsers: number;
  date: string | null;
}

const emptyDailyStats = (): DailyStats => ({
  totalWords: 0,
  totalAudio: 0,
  totalContributors: 0,
  totalRegions: 0,
  totalUsers: 0,
  date: null,
});

export const getDailyStats = async (): Promise<DailyStats> => {
  try {
    const snapshot = await getDoc(doc(db, 'daily_reports', 'stats'));
    if (!snapshot.exists()) return emptyDailyStats();
    const data = snapshot.data() as DocumentData;
    return {
      totalWords: Number(data.totalWords) || 0,
      totalAudio: Number(data.totalAudio) || 0,
      totalContributors: Number(data.totalContributors) || 0,
      totalRegions: Number(data.totalRegions) || 0,
      totalUsers: Number(data.totalUsers) || 0,
      date: typeof data.date === 'string' ? data.date : null,
    };
  } catch (error) {
    console.error('Error reading daily_reports/stats:', error);
    return emptyDailyStats();
  }
};

/**
 * Read the precomputed word-of-the-day snapshot written by the scheduled
 * `processWordOfTheDay` Cloud Function (runs at 00:00 IST). Falls back to
 * the legacy HTTP function when the snapshot doc is missing — that path
 * still hits the original on-the-fly selection and seeds the snapshot.
 */
export const getWordOfTheDay = async (): Promise<Word | null> => {
  try {
    const snapshot = await getDoc(doc(db, 'daily_reports', 'word_of_the_day'));
    if (snapshot.exists()) {
      const data = snapshot.data() as DocumentData;
      return (data.word as Word | null) ?? null;
    }
  } catch (error) {
    console.error('Error reading daily_reports/word_of_the_day:', error);
  }

  try {
    const response = await fetch(functionsBaseUrl('getWordOfTheDay'));
    const data = await response.json();
    if (data.success) return (data.wordOfTheDay as Word) ?? null;
    return null;
  } catch (error) {
    console.error('Error fetching word of the day:', error);
    return null;
  }
};

// ─── Admin callables ────────────────────────────────────────────────────

async function callFunction<TReq, TRes>(
  name: string,
  payload: TReq,
): Promise<TRes> {
  const { httpsCallable, getFunctions } = await import('firebase/functions');
  const functions = getFunctions();
  const fn = httpsCallable<TReq, TRes>(functions, name);
  const result = await fn(payload);
  return result.data;
}

export const getWordReports = async (wordId: string): Promise<unknown[]> => {
  try {
    const data = await callFunction<{ wordId: string }, { reports: unknown[] }>(
      'getWordReports',
      { wordId },
    );
    return data.reports;
  } catch (error) {
    console.error('Error getting word reports:', error);
    throw error;
  }
};

export const reviewWord = async (
  wordId: string,
  isApproved: boolean,
  rejectionReason: string | null = null,
): Promise<ServiceResult & { message?: string }> => {
  try {
    const data = await callFunction<
      { wordId: string; isApproved: boolean; rejectionReason: string | null },
      { message: string }
    >('reviewWord', { wordId, isApproved, rejectionReason });
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error reviewing word:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const resolveReport = async (
  reportId: string,
  resolution: string,
  actionTaken: string,
): Promise<ServiceResult & { message?: string }> => {
  try {
    const data = await callFunction<
      { reportId: string; resolution: string; actionTaken: string },
      { message: string }
    >('resolveReport', { reportId, resolution, actionTaken });
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error resolving report:', error);
    return { success: false, error: (error as Error).message };
  }
};

// ─── Corrections ────────────────────────────────────────────────────────

export interface SubmitCorrectionInput {
  type: CorrectionType;
  currentValue: string;
  proposedChange: string;
  explanation?: string;
}

export const submitCorrection = async (
  wordId: string,
  userId: string,
  correctionData: SubmitCorrectionInput,
): Promise<ServiceResult & { id?: string }> => {
  try {
    const correctionRecord = {
      word_id: wordId,
      user_id: userId,
      correction_type: correctionData.type,
      current_value: correctionData.currentValue,
      proposed_change: correctionData.proposedChange,
      explanation: correctionData.explanation || '',
      status: 'shallow_review' as const,
      review_level: 'community' as const,
      votes_for: 0,
      votes_against: 0,
      reviewed_by: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'corrections'), correctionRecord);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting correction:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getCorrectionsForReview = async (
  reviewLimit = 20,
  statusFilters: string[] | null = null,
): Promise<Correction[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    if (statusFilters && statusFilters.length > 0) {
      constraints.push(where('status', 'in', statusFilters));
    } else {
      constraints.push(where('status', '==', 'shallow_review'));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    if (reviewLimit) constraints.push(limit(reviewLimit));

    const q = query(collection(db, 'corrections'), ...constraints);
    const querySnapshot = await getDocs(q);
    const corrections: Correction[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const correctionData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Correction;
      try {
        const wordDoc = await getDoc(doc(db, 'words', correctionData.word_id));
        if (wordDoc.exists()) {
          correctionData.word = { id: wordDoc.id, ...wordDoc.data() } as Word;
        }
      } catch (wordErr) {
        console.error('Error fetching word for correction:', wordErr);
      }
      corrections.push(correctionData);
    }
    return corrections;
  } catch (error) {
    console.error('Error getting corrections for review:', error);
    return [];
  }
};

export const voteOnCorrection = async (
  correctionId: string,
  userId: string,
  vote: 'approve' | 'reject',
  comment = '',
): Promise<ServiceResult & { message?: string }> => {
  try {
    const correctionRef = doc(db, 'corrections', correctionId);
    const correctionDoc = await getDoc(correctionRef);
    if (!correctionDoc.exists()) throw new Error('Correction not found');

    const correctionData = correctionDoc.data() as Correction;
    const reviewedBy = correctionData.reviewed_by || [];

    if (reviewedBy.some((review) => review.user_id === userId)) {
      throw new Error('You have already voted on this correction');
    }

    const newReview = {
      user_id: userId,
      vote,
      comment,
      timestamp: new Date(),
    };

    const updatedReviewedBy = [...reviewedBy, newReview];
    const votesFor =
      vote === 'approve'
        ? (correctionData.votes_for || 0) + 1
        : correctionData.votes_for || 0;
    const votesAgainst =
      vote === 'reject'
        ? (correctionData.votes_against || 0) + 1
        : correctionData.votes_against || 0;

    let newStatus: Correction['status'] = correctionData.status;
    if (votesFor >= 3) newStatus = 'approved';
    else if (votesAgainst >= 3) newStatus = 'rejected';

    await updateDoc(correctionRef, {
      reviewed_by: updatedReviewedBy,
      votes_for: votesFor,
      votes_against: votesAgainst,
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message:
        newStatus === 'approved'
          ? 'Correction approved!'
          : newStatus === 'rejected'
            ? 'Correction rejected!'
            : 'Vote recorded successfully!',
    };
  } catch (error) {
    console.error('Error voting on correction:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const applyCorrection = async (
  correctionId: string,
): Promise<ServiceResult & { message?: string }> => {
  try {
    const correctionRef = doc(db, 'corrections', correctionId);
    const correctionDoc = await getDoc(correctionRef);
    if (!correctionDoc.exists()) throw new Error('Correction not found');

    const correction = correctionDoc.data() as Correction;
    const wordRef = doc(db, 'words', correction.word_id);
    const wordDoc = await getDoc(wordRef);
    if (!wordDoc.exists()) throw new Error('Word not found');

    const wordData = wordDoc.data() as Word;
    const updateData: Record<string, unknown> = {};

    switch (correction.correction_type) {
      case 'word_spelling':
        updateData.kurukh_word = correction.proposed_change;
        break;
      case 'definition':
        if (wordData.meanings) {
          updateData.meanings = wordData.meanings.map((meaning) =>
            meaning.definition === correction.current_value
              ? { ...meaning, definition: correction.proposed_change }
              : meaning,
          );
        }
        break;
      case 'part_of_speech':
        updateData.part_of_speech = correction.proposed_change;
        break;
      case 'example_sentence':
        if (wordData.meanings) {
          updateData.meanings = wordData.meanings.map((meaning) =>
            meaning.example_sentence_kurukh === correction.current_value
              ? { ...meaning, example_sentence_kurukh: correction.proposed_change }
              : meaning,
          );
        }
        break;
      case 'example_translation':
        if (wordData.meanings) {
          updateData.meanings = wordData.meanings.map((meaning) =>
            meaning.example_sentence_translation === correction.current_value
              ? {
                  ...meaning,
                  example_sentence_translation: correction.proposed_change,
                }
              : meaning,
          );
        }
        break;
      case 'pronunciation':
        updateData.pronunciation_guide = correction.proposed_change;
        break;
      default:
        throw new Error(
          'Unknown correction type: ' + (correction.correction_type as string),
        );
    }

    updateData.updatedAt = serverTimestamp();
    updateData.last_correction_applied = {
      correction_id: correctionId,
      applied_at: serverTimestamp(),
      correction_type: correction.correction_type,
    };

    await updateDoc(wordRef, updateData);
    await updateDoc(correctionRef, {
      status: 'applied',
      applied_at: serverTimestamp(),
      applied_to_word: true,
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: 'Correction applied successfully to the word' };
  } catch (error) {
    console.error('Error applying correction:', error);
    return { success: false, error: (error as Error).message };
  }
};

// ─── Community review ───────────────────────────────────────────────────

export const getWordsForCommunityReview = async (
  maxLimit = 20,
  statusFilters: string[] | null = null,
): Promise<Word[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    if (statusFilters && statusFilters.length > 0) {
      constraints.push(where('status', 'in', statusFilters));
    } else {
      constraints.push(where('status', '==', 'community_review'));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    if (maxLimit) constraints.push(limit(maxLimit));

    const q = query(wordsCollection, ...constraints);
    const querySnapshot = await getDocs(q);
    const words: Word[] = [];
    querySnapshot.forEach((d) => {
      words.push({ id: d.id, ...d.data() } as Word);
    });
    return words;
  } catch (error) {
    console.error('Error getting words for community review:', error);
    return [];
  }
};

export const voteOnWord = async (
  wordId: string,
  userId: string,
  vote: 'approve' | 'reject',
  comment = '',
): Promise<ServiceResult & { message?: string }> => {
  try {
    const wordRef = doc(db, 'words', wordId);
    const wordDoc = await getDoc(wordRef);
    if (!wordDoc.exists()) throw new Error('Word not found');

    const wordData = wordDoc.data() as Word;
    const reviewedBy = wordData.reviewed_by || [];

    if (wordData.contributor_id === userId) {
      throw new Error('You cannot vote on your own contribution');
    }
    if (wordData.status !== 'community_review') {
      throw new Error('This word is no longer available for community review');
    }
    if (reviewedBy.some((review) => review.user_id === userId)) {
      throw new Error('You have already voted on this word');
    }

    const newReview: WordVoteRecord = {
      user_id: userId,
      vote,
      comment,
      timestamp: new Date(),
    };

    const updatedReviewedBy = [...reviewedBy, newReview];
    const votesFor =
      vote === 'approve'
        ? (wordData.community_votes_for || 0) + 1
        : wordData.community_votes_for || 0;
    const votesAgainst =
      vote === 'reject'
        ? (wordData.community_votes_against || 0) + 1
        : wordData.community_votes_against || 0;

    let newStatus: WordStatus = wordData.status;
    if (votesFor >= 5) newStatus = 'pending_review';
    else if (votesAgainst >= 5) newStatus = 'community_rejected';

    await updateDoc(wordRef, {
      reviewed_by: updatedReviewedBy,
      community_votes_for: votesFor,
      community_votes_against: votesAgainst,
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message:
        newStatus === 'pending_review'
          ? 'Word approved for admin review!'
          : newStatus === 'community_rejected'
            ? 'Word rejected by community!'
            : 'Vote recorded successfully!',
    };
  } catch (error) {
    console.error('Error voting on word:', error);
    return { success: false, error: (error as Error).message };
  }
};

// ─── Home page ──────────────────────────────────────────────────────────

export interface HomePageData {
  recentWords: Word[];
  wordOfTheDay: Word | null;
  lastUpdated: Date | null;
  generatedAt: string;
  date: string;
}

export const getHomePageData = async (): Promise<HomePageData> => {
  const today = new Date().toISOString().split('T')[0];

  // Word of the day now lives in /daily_reports/word_of_the_day, written by
  // the midnight-IST scheduled function. Recent words still come from the
  // precomputed /static_data/home-page bundle.
  const [wordOfTheDay, recentWords] = await Promise.all([
    getWordOfTheDay(),
    (async (): Promise<Word[]> => {
      try {
        const homePageDoc = await getDoc(doc(db, 'static_data', 'home-page'));
        if (homePageDoc.exists()) {
          const data = homePageDoc.data() as DocumentData;
          return (data.recentWords as Word[]) || [];
        }
        console.warn(
          'static_data/home-page missing; falling back to live recent words',
        );
        return await getRecentWords(6);
      } catch (error) {
        console.error('Error fetching recent words:', error);
        try {
          return await getRecentWords(6);
        } catch (fallbackError) {
          console.error('Recent-words fallback failed:', fallbackError);
          return [];
        }
      }
    })(),
  ]);

  return {
    recentWords,
    wordOfTheDay,
    lastUpdated: new Date(),
    generatedAt: new Date().toISOString(),
    date: today,
  };
};
