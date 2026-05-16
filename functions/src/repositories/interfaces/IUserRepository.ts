import type { UserDocument, NewUserDocument } from '../../types/firestore.types';

export interface IUserRepository {
  getUserById(uid: string): Promise<UserDocument | null>;
  createUser(uid: string, data: NewUserDocument): Promise<void>;
  countUsers(): Promise<number>;
  isAdmin(uid: string): Promise<boolean>;
}
