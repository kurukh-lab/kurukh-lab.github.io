import { describe, test, it, expect, vi, beforeEach } from 'vitest';
import { wordReviewService } from '../services/wordReviewService';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('../config/firebase', () => ({ db: {} }));

describe('Word Review Service', () => {
  let mockWordSnapshot: {
    exists: () => boolean;
    id: string;
    data: () => Record<string, unknown>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockWordSnapshot = {
      exists: () => true,
      id: 'test-word-id',
      data: () => ({
        kurukh_word: 'test-word',
        status: 'pending_review',
        votes_for: 2,
        votes_against: 1,
        reviewed_by: [
          { userId: 'user1', vote: 'approve' },
          { userId: 'user2', vote: 'approve' },
          { userId: 'user3', vote: 'reject' },
        ],
        status_history: [
          { action: 'submitted', timestamp: { seconds: 1621234567, nanoseconds: 0 } },
          {
            action: 'sent_to_community_review',
            timestamp: { seconds: 1621234667, nanoseconds: 0 },
          },
        ],
        createdAt: { seconds: 1621234567, nanoseconds: 0 },
      }),
    };

    (getDoc as ReturnType<typeof vi.fn>).mockResolvedValue(mockWordSnapshot);
    (doc as ReturnType<typeof vi.fn>).mockReturnValue({ id: 'test-word-id' });
  });

  describe('loadWordStatus', () => {
    it('should load word status and map to machine state correctly', async () => {
      const original = mockWordSnapshot.data;
      mockWordSnapshot.data = () => ({
        ...original(),
        status: 'in_community_review',
      });

      const result = await wordReviewService.loadWordStatus('test-word-id');

      expect(doc).toHaveBeenCalledWith(db, 'words', 'test-word-id');
      expect(getDoc).toHaveBeenCalled();
      expect(result.state).toBe('inCommunityReview');
      expect(result.context.wordId).toBe('test-word-id');
      expect(result.context.communityVotes.for).toBe(2);
      expect(result.context.communityVotes.against).toBe(1);
      expect(result.context.reviewedBy.length).toBe(3);
    });

    it('should throw an error if word does not exist', async () => {
      mockWordSnapshot.exists = () => false;
      await expect(
        wordReviewService.loadWordStatus('non-existent'),
      ).rejects.toThrow();
    });
  });

  describe('updateWordStatus', () => {
    it('should update word status in Firestore correctly', async () => {
      const state = 'approved' as const;
      const context = {
        communityVotes: { for: 5, against: 2 },
        reviewedBy: [{ userId: 'user1', vote: 'approve' as const }],
      };

      await wordReviewService.updateWordStatus('test-word-id', state, context);

      expect(doc).toHaveBeenCalledWith(db, 'words', 'test-word-id');
      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'test-word-id' },
        expect.objectContaining({
          status: 'approved',
          votes_for: 5,
          votes_against: 2,
          reviewed_by: [{ userId: 'user1', vote: 'approve' }],
        }),
      );
    });
  });

  describe('transitionWord', () => {
    it('should transition a word from pending_review to approved', async () => {
      const result = await wordReviewService.transitionWord(
        'test-word-id',
        'ADMIN_APPROVE',
        { userId: 'admin1' },
      );

      expect(result.success).toBe(true);
      expect(result.state).toBe('approved');
      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'test-word-id' },
        expect.objectContaining({ status: 'approved' }),
      );

      const updateCall = (updateDoc as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as { history: Array<{ action: string; userId?: string }> };
      const historyEntry = updateCall.history[updateCall.history.length - 1];
      expect(historyEntry.action).toBe('admin_approve');
      expect(historyEntry.userId).toBe('admin1');
    });

    it('should handle errors in transition process', async () => {
      (getDoc as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Firestore error'),
      );

      const result = await wordReviewService.transitionWord(
        'test-word-id',
        'ADMIN_APPROVE',
        { userId: 'admin1' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });
});
