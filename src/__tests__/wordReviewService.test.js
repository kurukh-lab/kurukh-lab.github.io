/**
 * Unit tests for the wordReviewService
 * 
 * These tests verify that the word review service correctly manages state transitions
 * and integrates with Firestore.
 * 
 * @jest
 */

import { wordReviewService } from '../services/wordReviewService';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn()
}));

// Mock Firebase config
jest.mock('../config/firebase', () => ({
  db: {}
}));

describe('Word Review Service', () => {
  let mockWordSnapshot;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock word data
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
          { userId: 'user3', vote: 'reject' }
        ],
        status_history: [
          { action: 'submitted', timestamp: { seconds: 1621234567, nanoseconds: 0 } },
          { action: 'sent_to_community_review', timestamp: { seconds: 1621234667, nanoseconds: 0 } }
        ],
        createdAt: { seconds: 1621234567, nanoseconds: 0 }
      })
    };
    
    // Setup getDoc to return our mock word
    getDoc.mockResolvedValue(mockWordSnapshot);
    
    // Setup doc to return a mock document reference
    doc.mockReturnValue({ id: 'test-word-id' });
  });
  
  describe('loadWordStatus', () => {
    it('should load word status and map to machine state correctly', async () => {
      // Set up specific status for this test
      mockWordSnapshot.data = () => ({
        ...mockWordSnapshot.data(),
        status: 'in_community_review'
      });
      
      const result = await wordReviewService.loadWordStatus('test-word-id');
      
      // Assertions
      expect(doc).toHaveBeenCalledWith(db, 'words', 'test-word-id');
      expect(getDoc).toHaveBeenCalled();
      expect(result.state).toBe('inCommunityReview');
      expect(result.context.wordId).toBe('test-word-id');
      expect(result.context.communityVotes.for).toBe(2);
      expect(result.context.communityVotes.against).toBe(1);
      expect(result.context.reviewedBy.length).toBe(3);
    });
    
    it('should throw an error if word does not exist', async () => {
      // Set up non-existent word
      mockWordSnapshot.exists = () => false;
      
      await expect(wordReviewService.loadWordStatus('non-existent')).rejects.toThrow();
    });
  });
  
  describe('updateWordStatus', () => {
    it('should update word status in Firestore correctly', async () => {
      const state = 'approved';
      const context = {
        communityVotes: { for: 5, against: 2 },
        reviewedBy: [{ userId: 'user1', vote: 'approve' }]
      };
      
      await wordReviewService.updateWordStatus('test-word-id', state, context);
      
      // Assertions
      expect(doc).toHaveBeenCalledWith(db, 'words', 'test-word-id');
      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'test-word-id' },
        expect.objectContaining({
          status: 'approved',
          votes_for: 5,
          votes_against: 2,
          reviewed_by: [{ userId: 'user1', vote: 'approve' }]
        })
      );
    });
  });
  
  describe('transitionWord', () => {
    it('should transition a word from pending_review to approved', async () => {
      const result = await wordReviewService.transitionWord(
        'test-word-id', 
        'ADMIN_APPROVE', 
        { userId: 'admin1' }
      );
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.state).toBe('approved');
      
      // Check updateDoc was called with the right parameters
      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'test-word-id' },
        expect.objectContaining({
          status: 'approved'
        })
      );
      
      // Check that history was updated
      const updateCall = updateDoc.mock.calls[0][1];
      const historyEntry = updateCall.history[updateCall.history.length - 1];
      expect(historyEntry.action).toBe('admin_approve');
      expect(historyEntry.userId).toBe('admin1');
    });
    
    it('should handle errors in transition process', async () => {
      // Force an error
      getDoc.mockRejectedValue(new Error('Firestore error'));
      
      const result = await wordReviewService.transitionWord(
        'test-word-id', 
        'ADMIN_APPROVE', 
        { userId: 'admin1' }
      );
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });
});
