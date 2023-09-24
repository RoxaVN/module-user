import {
  CheckAccessTokenService,
  DatabaseService,
  inject,
} from '@roxavn/core/server';
import { TokenService } from '@roxavn/module-utils/server';

import { Raw } from 'typeorm';
import { AccessToken } from '../entities/index.js';
import { serverModule } from '../module.js';

@serverModule.rebind(CheckAccessTokenService)
export class CheckAccessTokenServiceEx extends CheckAccessTokenService {
  constructor(
    @inject(DatabaseService) protected databaseService: DatabaseService,
    @inject(TokenService) protected tokenService: TokenService
  ) {
    super();
  }

  async handle({ token }: { token: string | null }) {
    if (!token) {
      return;
    }

    const signatureIndex = token.lastIndexOf('.');
    if (signatureIndex < 0) {
      return;
    }

    const signature = token.slice(signatureIndex + 1);
    const tokenPart = token.slice(0, signatureIndex);
    const isValid = await this.tokenService.signer.verify(tokenPart, signature);
    if (!isValid) {
      return;
    }

    const userId = tokenPart.split('.')[1];

    const accessToken: { userId: string; id: string } | null =
      await this.databaseService.manager.getRepository(AccessToken).findOne({
        select: ['userId', 'id'],
        where: {
          userId: userId,
          token: signature,
          expiryDate: Raw((alias) => `${alias} > NOW()`),
        },
        cache: 60000, // 1 minute,
      });

    if (!accessToken) {
      return;
    }

    return {
      user: { id: accessToken.userId },
      accessToken: { id: accessToken.id },
    };
  }
}
