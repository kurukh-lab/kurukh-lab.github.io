/**
 * Service mapping the XState wordReviewMachine ↔ Firestore document.
 */

import { doc, updateDoc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Word, WordStatus } from '../types';

export type WordReviewMachineState =
  | 'draft'
  | 'submitted'
  | 'pendingCommunityReview'
  | 'inCommunityReview'
  | 'communityApproved'
  | 'communityRejected'
  | 'pendingAdminReview'
  | 'inAdminReview'
  | 'approved'
  | 'rejected';

export interface WordReviewContext {
  wordId: string;
  wordData: Word | null;
  communityVotes: { for: number; against: number };
  reviewedBy: Array<{ user_id?: string; userId?: string; vote: 'approve' | 'reject'; timestamp?: unknown }>;
  history: Array<Record<string, unknown>>;
}

export interface WordReviewSnapshot {
  state: WordReviewMachineState;
  context: WordReviewContext;
}

export interface WordReviewTransitionResult {
  success: boolean;
  state?: WordReviewMachineState;
  context?: WordReviewContext;
  error?: string;
}

const stateToStatusMap: Record<WordReviewMachineState, WordStatus> = {
  draft: 'draft',
  submitted: 'submitted',
  pendingCommunityReview: 'pending_community_review',
  inCommunityReview: 'in_community_review',
  communityApproved: 'community_approved',
  communityRejected: 'community_rejected',
  pendingAdminReview: 'pending_review',
  inAdminReview: 'in_admin_review',
  approved: 'approved',
  rejected: 'rejected',
};

const statusToStateMap: Record<string, WordReviewMachineState> = {
  draft: 'draft',
  submitted: 'submitted',
  pending_community_review: 'pendingCommunityReview',
  in_community_review: 'inCommunityReview',
  community_approved: 'communityApproved',
  community_rejected: 'communityRejected',
  pending_review: 'pendingAdminReview',
  in_admin_review: 'inAdminReview',
  approved: 'approved',
  rejected: 'rejected',
  // Aliases for existing data
  community_review: 'inCommunityReview',
};

const eventToStateMap: Record<string, WordReviewMachineState> = {
  SUBMIT: 'submitted',
  SEND_TO_ADMIN_REVIEW: 'pendingAdminReview',
  SEND_TO_COMMUNITY_REVIEW: 'pendingCommunityReview',
  START_COMMUNITY_REVIEW: 'inCommunityReview',
  COMMUNITY_APPROVED: 'communityApproved',
  COMMUNITY_REJECTED: 'communityRejected',
  ADMIN_APPROVE: 'approved',
  ADMIN_REJECT: 'rejected',
  START_ADMIN_REVIEW: 'inAdminReview',
  SEND_BACK_TO_COMMUNITY: 'pendingCommunityReview',
};

const toContext = (wordId: string, raw: Record<string, unknown>): WordReviewContext => ({
  wordId,
  wordData: { id: wordId, ...raw } as Word,
  communityVotes: {
    for:
      (raw.community_votes_for as number | undefined) ??
      (raw.votes_for as number | undefined) ??
      0,
    against:
      (raw.community_votes_against as number | undefined) ??
      (raw.votes_against as number | undefined) ??
      0,
  },
  reviewedBy: (raw.reviewed_by as WordReviewContext['reviewedBy']) || [],
  history: (raw.status_history as WordReviewContext['history']) || [],
});

export const wordReviewService = {
  /** Update the word status in Firestore based on current machine state. */
  updateWordStatus: async (
    wordId: string,
    state: WordReviewMachineState,
    context: Partial<WordReviewContext> = {},
  ): Promise<void> => {
    const status = stateToStatusMap[state] ?? 'submitted';
    const wordRef = doc(db, 'words', wordId);

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (context.communityVotes) {
      updateData.votes_for = context.communityVotes.for;
      updateData.votes_against = context.communityVotes.against;
    }
    if (context.reviewedBy && context.reviewedBy.length > 0) {
      updateData.reviewed_by = context.reviewedBy;
    }
    if (context.history && context.history.length > 0) {
      updateData.history = context.history;
    }

    await updateDoc(wordRef, updateData);
  },

  loadWordStatus: async (wordId: string): Promise<WordReviewSnapshot> => {
    const wordSnap = await getDoc(doc(db, 'words', wordId));
    if (!wordSnap.exists()) {
      throw new Error(`Word with ID ${wordId} not found`);
    }
    const raw = wordSnap.data() as Record<string, unknown>;
    const state = statusToStateMap[raw.status as string] ?? 'submitted';
    return { state, context: toContext(wordId, raw) };
  },

  transitionWord: async (
    wordId: string,
    event: string,
    payload: Record<string, unknown> = {},
    currentContext: Partial<WordReviewContext> = {},
  ): Promise<WordReviewTransitionResult> => {
    try {
      const { state, context } = await wordReviewService.loadWordStatus(wordId);
      const newState = eventToStateMap[event] ?? state;

      const newHistory = [
        ...(context.history || []),
        {
          action: event.toLowerCase(),
          timestamp: new Date(),
          ...payload,
        },
      ];

      const newContext: WordReviewContext = {
        ...context,
        ...currentContext,
        history: newHistory,
      };

      await wordReviewService.updateWordStatus(wordId, newState, newContext);
      return { success: true, state: newState, context: newContext };
    } catch (error) {
      console.error('Error transitioning word state:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  subscribeToWordStatus: (
    wordId: string,
    callback: (snapshot: WordReviewSnapshot) => void,
  ): Unsubscribe => {
    if (!wordId) {
      console.error('Word ID is required to subscribe to status changes');
      return () => {};
    }

    const wordRef = doc(db, 'words', wordId);
    return onSnapshot(
      wordRef,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          console.error(`Word with ID ${wordId} not found in Firestore`);
          return;
        }
        const raw = docSnapshot.data() as Record<string, unknown>;
        const state = statusToStateMap[raw.status as string] ?? 'submitted';
        callback({ state, context: toContext(wordId, raw) });
      },
      (error) => {
        console.error(
          `Error listening to word status changes for ${wordId}:`,
          error,
        );
      },
    );
  },
};

export default wordReviewService;
