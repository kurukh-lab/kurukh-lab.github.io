import type { Word } from './firestore.types';

export interface ReviewWordRequest {
  wordId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

export interface ResolveReportRequest {
  reportId: string;
  resolution: string;
  actionTaken: string;
}

export interface GetWordReportsRequest {
  wordId: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
}

export interface CreateGoogleUserRequest {
  username?: string;
}

export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export interface FirebaseAuthError extends Error {
  code: string;
}

export function isFirebaseAuthError(err: unknown): err is FirebaseAuthError {
  return err instanceof Error && 'code' in err;
}

export interface DictionaryStatsResult {
  totalApprovedWords: number;
  totalPendingWords: number;
  totalUsers: number;
  lastUpdated: string;
}

export interface WordOfTheDayHttpResult {
  wordOfTheDay: Word | null;
  date: string;
}

export interface HomePageUpdateData {
  recentWordsCount: number;
  wordOfTheDay: string | undefined;
  wordOfTheDayId: string | undefined;
  date: string;
  timestamp: string;
}

export type HomePageUpdateResult =
  | { success: true; message: string; data: HomePageUpdateData }
  | { success: false; error: string };

export interface CreateUserResult {
  uid: string;
  message: string;
}

export interface CreateGoogleUserResult {
  isNewUser: boolean;
  message: string;
}
