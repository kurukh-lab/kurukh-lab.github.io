import { useActor } from '@xstate/react';
import { useEffect, useState } from 'react';
import { wordReviewMachine } from '../state/wordReviewMachine';
import { wordReviewService, type WordReviewMachineState } from '../services/wordReviewService';
import type { Word } from '../types';

export interface UseWordReviewOptions {
  wordId?: string | null;
  wordData?: Partial<Word> | null;
  useRealTimeUpdates?: boolean;
}

const stateLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  pendingCommunityReview: 'Pending Community Review',
  inCommunityReview: 'In Community Review',
  communityApproved: 'Community Approved',
  communityRejected: 'Community Rejected',
  pendingAdminReview: 'Pending Admin Review',
  inAdminReview: 'In Admin Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const useWordReview = ({
  wordId = null,
  wordData = null,
  useRealTimeUpdates = false,
}: UseWordReviewOptions = {}) => {
  const [isListening, setIsListening] = useState(false);

  const [snapshot, send] = useActor(wordReviewMachine, {
    input: { wordId, wordData },
  });

  useEffect(() => {
    let unsubscribe = () => {};
    if (useRealTimeUpdates && wordId && !isListening) {
      setIsListening(true);
      unsubscribe = wordReviewService.subscribeToWordStatus(
        wordId,
        ({ state: firebaseState, context }) => {
          send({
            type: 'SYNC_STATE',
            state: firebaseState,
            context,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        },
      );
    }
    return () => {
      unsubscribe();
      setIsListening(false);
    };
  }, [wordId, useRealTimeUpdates, isListening, send]);

  const currentState = snapshot.value as WordReviewMachineState;
  const context = snapshot.context;

  const getStatusText = (): string => stateLabels[currentState] || 'Unknown';

  const isInState = (checkState: string | string[]): boolean => {
    if (Array.isArray(checkState)) return checkState.includes(currentState);
    return currentState === checkState;
  };

  const updateWordData = (newData: Partial<Word>): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send({ type: 'UPDATE_WORD_DATA', data: newData } as any);
  };

  const canBeEdited = (): boolean => isInState(['draft', 'submitted']);
  const isInFinalState = (): boolean =>
    isInState(['approved', 'rejected', 'communityRejected']);
  const isInCommunityReview = (): boolean =>
    isInState([
      'pendingCommunityReview',
      'inCommunityReview',
      'communityApproved',
      'communityRejected',
    ]);
  const isInAdminReview = (): boolean =>
    isInState(['pendingAdminReview', 'inAdminReview']);

  const getCommunityVotes = () => context.communityVotes;
  const getHistory = () => context.history;

  return {
    state: currentState,
    context,
    send,
    getStatusText,
    isInState,
    updateWordData,
    canBeEdited,
    isInFinalState,
    isInCommunityReview,
    isInAdminReview,
    getCommunityVotes,
    getHistory,
    isRealTimeActive: isListening,
  };
};

export default useWordReview;
