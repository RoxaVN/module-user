import {
  BaseService,
  DatabaseService,
  InjectDatabaseService,
  inject,
} from '@roxavn/core/server';
import { InferApiRequest } from '@roxavn/core/base';
import { TokenService } from '@roxavn/module-utils/server';

import { accessTokenApi } from '../../base/index.js';
import { AccessToken } from '../entities/index.js';
import { serverModule } from '../module.js';
import { Env } from '../config.js';

@serverModule.useApi(accessTokenApi.getMany)
export class GetAccessTokensApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof accessTokenApi.getMany>) {
    const page = request.page || 1;
    const pageSize = 10;

    const [users, totalItems] = await this.entityManager
      .getRepository(AccessToken)
      .findAndCount({
        where: {
          userId: request.userId,
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    return {
      items: users,
      pagination: { page, pageSize, totalItems },
    };
  }
}

@serverModule.useApi(accessTokenApi.delete)
export class DeleteAccessTokenApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof accessTokenApi.delete>) {
    await this.entityManager
      .getRepository(AccessToken)
      .delete({ id: request.accessTokenId });
    return {};
  }
}

@serverModule.injectable()
export class CreateAccessTokenService extends BaseService {
  constructor(
    @inject(DatabaseService) protected databaseService: DatabaseService,
    @inject(TokenService) protected tokenService: TokenService
  ) {
    super();
  }

  async handle(request: {
    userId: string;
    identityid: string;
    authenticator: string;
    ipAddress: string;
    userAgent?: string | null;
  }) {
    const token = await this.tokenService.creator.create({
      alphabetType: 'ALPHA_NUM',
      size: 21,
    });
    const expiredAt = new Date(Date.now() + Env.ACCESS_TOKEN_TIME_TO_LIVE);
    const tokenPart = [expiredAt.getTime(), request.userId, token].join('.');
    const signature = this.tokenService.signer.sign(tokenPart);
    const tokenFinal = [tokenPart, signature].join('.');

    const accessToken = new AccessToken();
    accessToken.userId = request.userId;
    accessToken.identityId = request.identityid;
    accessToken.authenticator = request.authenticator;
    accessToken.token = signature;
    accessToken.expiryDate = expiredAt;
    accessToken.ipAddress = request.ipAddress;
    accessToken.userAgent = request.userAgent || undefined;
    await this.databaseService.manager
      .getRepository(AccessToken)
      .save(accessToken);

    return {
      id: accessToken.id,
      userId: request.userId,
      accessToken: tokenFinal,
    };
  }
}
