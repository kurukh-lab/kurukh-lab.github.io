import type { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type WordStatus =
  | 'draft'
  | 'submitted'
  | 'community_review'
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
  audio_url?: string;
  audio?: string;
  dialect?: string;
  region?: string;
}

export interface Word {
  id: string;
  kurukh_word: string;
  meanings: Meaning[];
  part_of_speech?: string;
  pronunciation_guide?: string;
  tags?: string[];
  contributor_id?: string;
  status: WordStatus;
  community_votes_for: number;
  community_votes_against: number;
  likedBy?: string[];
  likesCount: number;
  commentsCount?: number;
  rejection_reason?: string | null;
  audio_url?: string;
  pronunciation_audio_url?: string;
  dialect?: string;
  region?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserDocument {
  uid: string;
  username: string;
  email: string;
  roles: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NewUserDocument {
  uid: string;
  username: string;
  email: string;
  roles: ['user'];
}

export interface Report {
  id: string;
  word_id: string;
  user_id: string;
  reason: string;
  details?: string;
  status: 'open' | 'resolved';
  resolution?: string;
  action_taken?: string;
  resolved_by?: string;
  resolved_at?: Timestamp;
  createdAt: Timestamp;
}

export interface WordOfTheDaySnapshot {
  word: Word | null;
  date: string;
  generatedAt: FieldValue;
  generatedAtUTC: string;
}

export interface DailyStatsSnapshot {
  totalWords: number;
  totalAudio: number;
  totalContributors: number;
  totalRegions: number;
  totalUsers: number;
  date: string;
  generatedAt: FieldValue;
  generatedAtUTC: string;
}

export interface HomePageData {
  recentWords: Word[];
  wordOfTheDay: Word | null;
  lastUpdated: Date;
  generatedAt: string;
  date: string;
}

export interface DailyStatsRecord {
  date: string;
  userCount: number;
  approvedWordCount: number;
  dailyContributionCount: number;
}
