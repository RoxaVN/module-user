import { InferApiRequest, NotFoundException } from '@roxavn/core/base';
import {
  BaseService,
  DatabaseService,
  InjectDatabaseService,
  inject,
} from '@roxavn/core/server';
import { And, ILike, In, LessThan, MoreThan } from 'typeorm';

import { userApi } from '../../base/index.js';
import { User } from '../entities/index.js';
import { serverModule } from '../module.js';

@serverModule.useApi(userApi.getOne)
export class GetUserApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof userApi.getOne>) {
    const item = await this.entityManager.getRepository(User).findOne({
      cache: true,
      where: { id: request.userId },
    });

    if (item) {
      return item;
    }
    throw new NotFoundException();
  }
}

@serverModule.useApi(userApi.getMany)
export class GetUsersApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof userApi.getMany>) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    const [users, totalItems] = await this.entityManager
      .getRepository(User)
      .findAndCount({
        where: {
          username: request.usernameText
            ? ILike(request.username + '%')
            : request.username,
          createdDate:
            request.createdDate &&
            And(
              MoreThan(request.createdDate[0]),
              LessThan(request.createdDate[1])
            ),
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

@serverModule.useApi(userApi.search)
export class SearchUsersApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof userApi.search>) {
    const users = await this.entityManager.getRepository(User).find({
      select: ['id', 'username'],
      where: {
        id: request.ids && In(request.ids),
        username: request.usernameText
          ? ILike(request.usernameText + '%')
          : request.username,
      },
      take: request.ids ? request.ids.length : 10,
    });
    return {
      items: users,
    };
  }
}

@serverModule.useApi(userApi.create)
export class CreateUserApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof userApi.create>) {
    const user = new User();
    user.username = request.username;
    await this.entityManager.getRepository(User).save(user);

    return {
      id: user.id,
    };
  }
}

@serverModule.injectable()
export class GetOrCreateUserService extends BaseService {
  constructor(
    @inject(GetUsersApiService)
    public getUsersApiService: GetUsersApiService,
    @inject(DatabaseService)
    public databaseService: DatabaseService
  ) {
    super();
  }

  async handle(request: { username: string }) {
    const { items } = await this.getUsersApiService.handle({
      username: request.username,
    });
    if (items.length) {
      return items[0];
    } else {
      const user = new User();
      user.username = request.username;
      await this.databaseService.manager.getRepository(User).save(user);
      return user;
    }
  }
}
