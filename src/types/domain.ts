/**
 * Domain types for the Kurukh Dictionary.
 *
 * These mirror the Firestore document shapes documented in ARCHITECTURE.md
 * and enforced by [firestore.rules](../../firestore.rules). The names here are
 * deliberately the same as the field names in Firestore so the rules and the
 * types read the same.
 */

import type { Timestamp } from 'firebase/firestore';

// A Firestore field that can be a Timestamp coming back from Firestore, a
// Date going in from the client, or `null` when the doc was created with
// `serverTimestamp()` and is still resolving locally.
export type FirestoreDateLike = Timestamp | Date | null;

// ─── Users ──────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  roles: UserRole[];
  createdAt: FirestoreDateLike;
  updatedAt: FirestoreDateLike;
}

// ─── Words ──────────────────────────────────────────────────────────────

export type WordStatus =
  | 'draft'
  | 'submitted'
  | 'community_review'
  | 'pending_community_review'
  | 'in_community_review'
  | 'community_approved'
  | 'community_rejected'
  | 'pending_review'
  | 'in_admin_review'
  | 'approved'
  | 'rejected';

export interface Meaning {
  language: string;
  definition: string;
  example_sentence_kurukh?: string;
  example_sentence_translation?: string;
}

export interface WordVoteRecord {
  user_id: string;
  vote: 'approve' | 'reject';
  comment: string;
  timestamp: FirestoreDateLike;
}

export interface Word {
  id: string;
  kurukh_word: string;
  meanings: Meaning[];
  part_of_speech?: string;
  pronunciation_guide?: string;
  contributor_id: string;
  status: WordStatus;
  community_votes_for: number;
  community_votes_against: number;
  reviewed_by: WordVoteRecord[];
  likedBy: string[];
  likesCount: number;
  commentsCount?: number;
  rejection_reason?: string;
  last_correction_applied?: {
    correction_id: string;
    applied_at: FirestoreDateLike;
    correction_type: CorrectionType;
  };
  createdAt: FirestoreDateLike;
  updatedAt: FirestoreDateLike;
}

// Discriminator for whether the word document is hydrated from Firestore
// (has an id) or being constructed for a write.
export type WordDraft = Omit<Word, 'id'>;

// ─── Comments ───────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  wordId: string;
  userId: string;
  content: string;
  parentCommentId: string | null;
  createdAt: FirestoreDateLike;
  updatedAt: FirestoreDateLike;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  replyCount: number;
  isDeleted: boolean;
  isEdited?: boolean;
  deletedAt?: FirestoreDateLike;
  // Populated client-side; never written back to Firestore.
  userInfo?: {
    displayName: string;
    email: string;
  };
  replies?: Comment[];
  hasReplies?: boolean;
  repliesLoaded?: boolean;
}

// ─── Reports ────────────────────────────────────────────────────────────

export type ReportStatus = 'open' | 'resolved';

export interface Report {
  id: string;
  word_id: string;
  user_id: string;
  reason: string;
  details: string;
  status: ReportStatus;
  resolution?: string;
  action_taken?: string;
  resolved_by?: string;
  resolved_at?: FirestoreDateLike;
  createdAt: FirestoreDateLike;
}

// ─── Corrections ────────────────────────────────────────────────────────

export type CorrectionType =
  | 'word_spelling'
  | 'definition'
  | 'part_of_speech'
  | 'example_sentence'
  | 'example_translation'
  | 'pronunciation';

export type CorrectionStatus =
  | 'shallow_review'
  | 'approved'
  | 'rejected'
  | 'applied';

export interface CorrectionVoteRecord {
  user_id: string;
  vote: 'approve' | 'reject';
  comment: string;
  timestamp: FirestoreDateLike;
}

export interface Correction {
  id: string;
  word_id: string;
  user_id: string;
  correction_type: CorrectionType;
  current_value: string;
  proposed_change: string;
  explanation: string;
  status: CorrectionStatus;
  review_level: 'community' | 'admin';
  votes_for: number;
  votes_against: number;
  reviewed_by: CorrectionVoteRecord[];
  applied_at?: FirestoreDateLike;
  applied_to_word?: boolean;
  createdAt: FirestoreDateLike;
  updatedAt: FirestoreDateLike;
  // Hydrated client-side.
  word?: Word;
}

// ─── Service result envelopes ───────────────────────────────────────────
//
// Existing services use `{ success: true, ... } | { success: false, error }`.
// We keep a single open shape (rather than a strict discriminated union)
// because most call-sites carry extra fields (`message`, `id`, …) that vary
// per call. A migration to strict discrimination is a Phase 3 refactor.

export interface ServiceResult {
  success: boolean;
  error?: string;
  message?: string;
}

// ─── Search ─────────────────────────────────────────────────────────────

export interface SearchOptions {
  language?: string;
  partOfSpeech?: string;
}
