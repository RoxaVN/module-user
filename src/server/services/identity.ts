import { NotFoundException } from '@roxavn/core/base';
import {
  BaseService,
  DatabaseService,
  InjectDatabaseService,
  inject,
} from '@roxavn/core/server';
import { TokenService } from '@roxavn/module-utils/server';

import { Identity } from '../entities/index.js';
import { CreateAccessTokenService } from './access.token.js';
import { CreateUserApiService } from './user.js';
import { serverModule } from '../module.js';

@serverModule.injectable()
export class IdentityService extends BaseService {
  constructor(
    @inject(DatabaseService) protected databaseService: DatabaseService,
    @inject(TokenService) protected tokenService: TokenService,
    @inject(CreateUserApiService)
    protected createUserApiService: CreateUserApiService,
    @inject(CreateAccessTokenService)
    protected createAccessTokenService: CreateAccessTokenService
  ) {
    super();
  }

  async handle(request: {
    subject: string;
    type: string;
    authenticator: string;
    userAgent?: string | null;
    ipAddress: string;
  }) {
    const identity = await this.databaseService.manager
      .getRepository(Identity)
      .findOne({
        select: ['id', 'userId'],
        where: { subject: request.subject, type: request.type },
      });

    if (identity) {
      return this.createAccessTokenService.handle({
        identityid: identity.id,
        userId: identity.userId,
        authenticator: request.authenticator,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
      });
    }

    throw new NotFoundException();
  }
}

@serverModule.injectable()
export class IdentityAndRegisterService extends BaseService {
  constructor(
    @inject(DatabaseService) protected databaseService: DatabaseService,
    @inject(TokenService) protected tokenService: TokenService,
    @inject(CreateUserApiService)
    protected createUserApiService: CreateUserApiService,
    @inject(CreateAccessTokenService)
    protected createAccessTokenService: CreateAccessTokenService
  ) {
    super();
  }

  async handle(request: {
    subject: string;
    type: string;
    authenticator: string;
    userAgent?: string | null;
    ipAddress: string;
  }) {
    let identity = await this.databaseService.manager
      .getRepository(Identity)
      .findOne({
        select: ['id', 'userId'],
        where: { subject: request.subject, type: request.type },
      });

    if (!identity) {
      // random username
      const username =
        (await this.tokenService.creator.create({
          alphabetType: 'LOWERCASE_ALPHA',
          size: 1,
        })) +
        (await this.tokenService.creator.create({
          alphabetType: 'LOWERCASE_ALPHA_NUM',
          size: 15,
        }));
      const user = await this.createUserApiService.handle({
        username: username,
      });
      identity = new Identity();
      identity.type = request.type;
      identity.subject = request.subject;
      identity.userId = user.id;
      await this.databaseService.manager.save(identity);
    }

    return this.createAccessTokenService.handle({
      identityid: identity.id,
      userId: identity.userId,
      authenticator: request.authenticator,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    });
  }
}

@serverModule.injectable()
export class CreateIdentityService extends InjectDatabaseService {
  async handle(request: {
    subject: string;
    type: string;
    userId: string;
    metadata?: any;
  }) {
    const item = new Identity();
    Object.assign(item, request);

    await this.databaseService.manager.getRepository(Identity).insert(item);
    return { id: item.id };
  }
}

@serverModule.injectable()
export class GetIdentitiesService extends InjectDatabaseService {
  async handle(request: { userId: string; subject?: string; type?: string }) {
    const items = await this.entityManager.getRepository(Identity).find({
      where: {
        userId: request.userId,
        type: request.type,
        subject: request.subject,
      },
    });
    return items;
  }
}

@serverModule.injectable()
export class GetIdentityBytypeService extends InjectDatabaseService {
  async handle(request: { subject: string; type: string }) {
    const item = await this.entityManager.getRepository(Identity).findOne({
      where: {
        type: request.type,
        subject: request.subject,
      },
    });
    return item;
  }
}
