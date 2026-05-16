import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { IAuthProvider } from '../utils/authProvider';
import {
  isFirebaseAuthError,
  type CreateUserRequest,
  type CreateGoogleUserRequest,
  type CreateUserResult,
  type CreateGoogleUserResult,
} from '../types/service.types';

export class UserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authProvider: IAuthProvider
  ) {}

  async createUser(data: CreateUserRequest): Promise<CreateUserResult> {
    UserService.validateEmail(data.email);
    UserService.validatePassword(data.password);
    UserService.validateUsername(data.username);

    let uid: string;
    try {
      const userRecord = await this.authProvider.createUser({
        email: data.email,
        password: data.password,
        displayName: data.username,
      });
      uid = userRecord.uid;
    } catch (err) {
      if (isFirebaseAuthError(err)) {
        switch (err.code) {
          case 'auth/email-already-exists':
            throw new Error('An account with this email already exists');
          case 'auth/weak-password':
            throw new Error('Password is too weak');
          case 'auth/invalid-email':
            throw new Error('Invalid email address');
        }
      }
      throw new Error('Failed to create user account');
    }

    await this.userRepo.createUser(uid, {
      uid,
      username: data.username,
      email: data.email,
      roles: ['user'],
    });

    return { uid, message: 'User created successfully' };
  }

  async createGoogleUser(
    uid: string,
    email: string,
    name: string | undefined,
    data: CreateGoogleUserRequest
  ): Promise<CreateGoogleUserResult> {
    const finalUsername = data.username ?? name ?? email.split('@')[0];
    UserService.validateUsername(finalUsername);

    const existing = await this.userRepo.getUserById(uid);
    if (existing) {
      return { isNewUser: false, message: 'Welcome back! Redirecting to home page.' };
    }

    await this.userRepo.createUser(uid, {
      uid,
      username: finalUsername,
      email,
      roles: ['user'],
    });

    return { isNewUser: true, message: 'User document created successfully' };
  }

  private static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');
  }

  private static validatePassword(password: string): void {
    if (password.length < 6) throw new Error('Password must be at least 6 characters long');
  }

  private static validateUsername(username: string): void {
    if (!username || username.length < 2 || username.length > 50) {
      throw new Error('Username must be between 2 and 50 characters');
    }
  }
}
