import {
  ApiAuthenticatorMiddleware,
  BaseService,
  DatabaseService,
  LoaderAuthenticatorMiddleware,
  MiddlewareService,
  RouterContext,
  inject,
} from '@roxavn/core/server';
import { Cookie, constants } from '@roxavn/core/base';
import { Raw } from 'typeorm';
import { AccessToken } from '../entities/index.js';
import { serverModule } from '../module.js';
import { TokenService } from '@roxavn/module-utils/server';

@serverModule.injectable()
export class CheckTokenService extends BaseService {
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
        cache: {
          id: 'getAccessToken',
          milliseconds: 60000, // 1 minute
        },
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

@serverModule.rebind(ApiAuthenticatorMiddleware)
export class ApiAuthenticatorMiddlewareEx
  extends BaseService
  implements MiddlewareService
{
  constructor(
    @inject(CheckTokenService) protected checkTokenService: CheckTokenService
  ) {
    super();
  }

  async handle(
    { api, state, request }: RouterContext,
    next: () => Promise<void>
  ) {
    if (api?.permission) {
      const authorizationHeader = request.headers.get('authorization');
      const token =
        authorizationHeader && authorizationHeader.startsWith('Bearer ')
          ? authorizationHeader.slice(7)
          : null;
      const authData = await this.checkTokenService.handle({ token });
      Object.assign(state, authData);
    }
    return next();
  }
}

@serverModule.rebind(LoaderAuthenticatorMiddleware)
export class LoaderAuthenticatorMiddlewareEx
  extends BaseService
  implements MiddlewareService
{
  constructor(
    @inject(CheckTokenService) protected checkTokenService: CheckTokenService
  ) {
    super();
  }

  async handle(
    { api, state, request }: RouterContext,
    next: () => Promise<void>
  ) {
    if (api?.permission) {
      const cookie = request.headers.get('cookie');
      const token = cookie
        ? new Cookie(cookie).get(constants.Cookie.TOKEN)
        : null;
      const authData = await this.checkTokenService.handle({ token });
      Object.assign(state, authData);
    }
    return next();
  }
}
