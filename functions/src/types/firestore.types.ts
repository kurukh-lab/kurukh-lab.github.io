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
  dialect?: string;
  region?: string;
}

export interface WordLinguistics {
  grammatical_tag?: string;
  verb_class?: string;
  transitivity?: 'tr' | 'intr';
  gender?: 'm' | 'f';
  loanword_from?: string;
}

export interface WordBookSource {
  book: string;
  page_image?: string;
  page_label?: string;
  hindi_source?: string;
}

export interface Word {
  // Identity
  id: string;
  kurukh_word: string;
  kurukh_word_ascii: string;
  homograph_index?: number;

  // Linguistic structure
  part_of_speech?: string;
  linguistics?: WordLinguistics;

  // Core content
  meanings: Meaning[];
  notes?: string;
  example_phrase?: string;

  // Word relationships
  variant_of?: string;
  variants?: string[];

  // Audio & pronunciation
  pronunciation_guide?: string;
  audio_url?: string;

  // Dialect & region
  dialect?: string;
  region?: string;

  // Community & workflow
  status: WordStatus;
  contributor_id: string;
  community_votes_for: number;
  community_votes_against: number;
  likedBy: string[];
  likesCount: number;
  commentsCount: number;
  rejection_reason?: string | null;
  tags?: string[];

  // Provenance
  book_source?: WordBookSource;

  // Timestamps
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
