import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import type { UserDocument, NewUserDocument } from '../types/firestore.types';
import type { IUserRepository } from './interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  private static readonly COLLECTION = 'users';

  constructor(private readonly db: Firestore) { }

  async getUserById(uid: string): Promise<UserDocument | null> {
    const doc = await this.db.collection(UserRepository.COLLECTION).doc(uid).get();
    if (!doc.exists) return null;
    return doc.data() as UserDocument;
  }

  async createUser(uid: string, data: NewUserDocument): Promise<void> {
    await this.db
      .collection(UserRepository.COLLECTION)
      .doc(uid)
      .set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
  }

  async countUsers(): Promise<number> {
    const snap = await this.db.collection(UserRepository.COLLECTION).count().get();
    return snap.data().count;
  }

  async isAdmin(uid: string): Promise<boolean> {
    const user = await this.getUserById(uid);
    return user?.roles?.includes('admin') ?? false;
  }
}
