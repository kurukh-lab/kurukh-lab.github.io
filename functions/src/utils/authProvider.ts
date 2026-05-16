import type { Auth, DecodedIdToken, CreateRequest, UserRecord } from 'firebase-admin/auth';

export interface IAuthProvider {
  verifyIdToken(token: string): Promise<DecodedIdToken>;
  createUser(properties: CreateRequest): Promise<UserRecord>;
}

export class FirebaseAuthProvider implements IAuthProvider {
  constructor(private readonly auth: Auth) { }

  verifyIdToken(token: string): Promise<DecodedIdToken> {
    return this.auth.verifyIdToken(token);
  }

  createUser(properties: CreateRequest): Promise<UserRecord> {
    return this.auth.createUser(properties);
  }
}
