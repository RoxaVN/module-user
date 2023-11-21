import {
  BadRequestException,
  InferApiRequest,
  NotFoundException,
} from '@roxavn/core/base';
import {
  BaseService,
  GetUserScopeIdsApiService,
  InjectDatabaseService,
  SetUserRoleApiService,
  inject,
  moduleManager,
  CheckUserPermissionService,
} from '@roxavn/core/server';
import { Brackets, In } from 'typeorm';

import { userRoleApi } from '../../base/index.js';
import { Role, UserRole } from '../entities/index.js';
import { serverModule } from '../module.js';

@serverModule.useApi(userRoleApi.create)
export class CreateUserRoleApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof userRoleApi.create>) {
    const role = await this.entityManager.getRepository(Role).findOne({
      where: { id: request.roleId },
      select: ['scope', 'module'],
    });
    if (!role) {
      throw new NotFoundException();
    }
    if (
      (request.module && role.module !== request.module) ||
      (request.scope && role.scope !== request.scope)
    ) {
      throw new BadRequestException();
    }

    const userRole = new UserRole();
    userRole.userId = request.userId;
    userRole.roleId = request.roleId;
    userRole.scope = role.scope;
    if (request.scopeId) {
      userRole.scopeId = request.scopeId;
    }
    await this.entityManager.save(userRole);
    return {};
  }
}

@serverModule.useApi(userRoleApi.delete)
export class DeleteUserRoleApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof userRoleApi.delete>) {
    if (request.module || request.scope) {
      const isValid = await this.entityManager.getRepository(Role).count({
        where: {
          module: request.module,
          scope: request.scope,
          id: request.roleId,
        },
      });
      if (!isValid) {
        throw new BadRequestException();
      }
    }

    await this.entityManager.getRepository(UserRole).delete({
      scopeId: request.scopeId || '',
      userId: request.userId,
      roleId: request.roleId,
    });
    return {};
  }
}

@serverModule.useApi(userRoleApi.getAll)
export class GetUserRolesApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof userRoleApi.getAll>) {
    const items = await this.entityManager.getRepository(UserRole).find({
      relations: { role: true },
      select: {
        scopeId: true,
        role: {
          id: true,
          name: true,
          permissions: true,
          scope: true,
        },
      },
      where: {
        userId: request.userId,
        scopeId: request.scopeId || '',
        scope: request.scopes ? In(request.scopes) : request.scope,
      },
    });
    return {
      items: items.map((i) => ({ ...i.role, scopeId: i.scopeId })),
    };
  }
}

@serverModule.useApi(userRoleApi.modules)
export class GetUserRoleModulesApiService extends BaseService {
  constructor(
    @inject(GetUserRolesApiService)
    protected getUserRolesApiService: GetUserRolesApiService
  ) {
    super();
  }

  handle(request: InferApiRequest<typeof userRoleApi.modules>) {
    return this.getUserRolesApiService.handle({
      userId: request.userId,
      scopes: moduleManager.modules.map((m) => m.name),
    });
  }
}

@serverModule.rebind(GetUserScopeIdsApiService)
export class GetUserScopeIdsApiServiceEx
  extends InjectDatabaseService
  implements GetUserScopeIdsApiService
{
  async handle(request: {
    scope: string;
    userId: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    const [items, totalItems] = await this.entityManager
      .getRepository(UserRole)
      .findAndCount({
        select: { scopeId: true, userId: true, roleId: true },
        where: {
          userId: request.userId,
          scope: request.scope,
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    return {
      items: items,
      pagination: { page, pageSize, totalItems },
    };
  }
}

@serverModule.rebind(SetUserRoleApiService)
export class SetUserRoleApiServiceEx
  extends InjectDatabaseService
  implements SetUserRoleApiService
{
  async handle(request: {
    scope: string;
    scopeId: string;
    userId: string;
    roleName: string;
  }) {
    const role = await this.entityManager.getRepository(Role).findOne({
      select: ['id'],
      where: { scope: request.scope, name: request.roleName },
    });
    if (role) {
      const userRole = new UserRole();
      userRole.userId = request.userId;
      userRole.roleId = role.id;
      userRole.scope = request.scope;
      userRole.scopeId = request.scopeId;
      await this.entityManager.save(userRole);
      return {};
    }
    throw new NotFoundException();
  }
}

@serverModule.rebind(CheckUserPermissionService)
export class CheckUserPermissionServiceEx
  extends InjectDatabaseService
  implements CheckUserPermissionService
{
  async handle({
    userId,
    permission,
    scopes,
  }: {
    userId: string;
    permission: string;
    scopes: { name: string; id?: string }[];
  }) {
    const item = await this.databaseService.manager
      .getRepository(UserRole)
      .createQueryBuilder('userRole')
      .leftJoin(Role, 'role', 'userRole.roleId = role.id')
      .select('userRole.userId')
      .where('userRole.userId = :userId', { userId })
      .andWhere(':permission = ANY(role.permissions)', { permission })
      .andWhere(
        new Brackets((qb) => {
          scopes.map((scope, index) => {
            qb.orWhere(
              new Brackets((qb1) => {
                qb1
                  .where(`userRole.scope = :scope${index}`, {
                    [`scope${index}`]: scope.name,
                  })
                  .andWhere(`userRole.scopeId = :scopeId${index}`, {
                    [`scopeId${index}`]: scope.id || '',
                  });
              })
            );
          });
        })
      )
      .getRawOne();

    return !!item;
  }
}
