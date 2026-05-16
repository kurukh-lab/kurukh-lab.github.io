import type { Request } from 'firebase-functions/v2/https';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { IAuthProvider } from '../utils/authProvider';
import { HttpError } from '../types/service.types';

export class AdminAuthMiddleware {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authProvider: IAuthProvider
  ) { }

  async requireAdmin(req: Request): Promise<string> {
    const header = req.get('Authorization') ?? '';
    const match = header.match(/^Bearer (.+)$/);
    if (!match) throw new HttpError('Missing Bearer token', 401);

    const decoded = await this.authProvider.verifyIdToken(match[1]);
    const isAdmin = await this.userRepo.isAdmin(decoded.uid);
    if (!isAdmin) throw new HttpError('Admin role required', 403);

    return decoded.uid;
  }
}
