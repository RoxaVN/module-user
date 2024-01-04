import { InferApiRequest, type Role as RoleType } from '@roxavn/core/base';
import {
  CreateRolesService,
  InjectDatabaseService,
  SetAdminRoleService,
} from '@roxavn/core/server';
import { ILike, In } from 'typeorm';

import { roleApi, roles } from '../../base/index.js';
import { Role, UserRole } from '../entities/index.js';
import { serverModule } from '../module.js';

@serverModule.useApi(roleApi.getMany)
export class GetRolesApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof roleApi.getMany>) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    const [roles, totalItems] = await this.entityManager
      .getRepository(Role)
      .findAndCount({
        where: {
          id: request.ids && In(request.ids),
          module: request.module,
          scope: request.scopeText
            ? ILike(`%${request.scopeText}%`)
            : request.scope,
          hasId: !!request.scopeId,
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    return {
      items: roles,
      pagination: { page, pageSize, totalItems },
    };
  }
}

@serverModule.useApi(roleApi.moduleStats)
export class GetModuleRoleStatsApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof roleApi.moduleStats>) {
    const page = request.page || 1;
    const pageSize = 10;

    const totalItems = parseInt(
      (
        await this.entityManager
          .createQueryBuilder(UserRole, 'userRole')
          .select('COUNT(DISTINCT("userId"))', 'count')
          .where('userRole.scopeId = :scopeId', { scopeId: '' })
          .getRawOne()
      ).count
    );

    const users: any = await this.entityManager
      .createQueryBuilder(UserRole, 'userRole')
      .select('userRole.userId', 'userId')
      .addSelect('COUNT(userRole.userId)', 'rolesCount')
      .where('userRole.scopeId = :scopeId', { scopeId: '' })
      .groupBy('userRole.userId')
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getRawMany();

    return {
      items: users,
      pagination: { page, pageSize, totalItems },
    };
  }
}

@serverModule.rebind(SetAdminRoleService)
export class SetAdminRoleHook
  extends InjectDatabaseService
  implements SetAdminRoleService
{
  async handle(role: RoleType) {
    const users = await this.entityManager.getRepository(UserRole).find({
      select: { userId: true },
      where: {
        role: {
          name: roles.Admin.name,
          scope: roles.Admin.scope.name,
        },
      },
    });
    const roleModel = await this.entityManager.getRepository(Role).findOneBy({
      name: role.name,
      scope: role.scope.name,
    });
    if (roleModel) {
      const adminroles = users.map((user) => {
        const adminRole = new UserRole();
        adminRole.userId = user.userId;
        adminRole.roleId = roleModel.id;
        adminRole.scope = roleModel.scope;
        return adminRole;
      });
      await this.entityManager
        .createQueryBuilder(UserRole, 'userRole')
        .insert()
        .values(adminroles)
        .orIgnore()
        .execute();
    }
  }
}

@serverModule.rebind(CreateRolesService)
export class CreateRolesHook
  extends InjectDatabaseService
  implements CreateRolesService
{
  async handle(roles: Record<string, RoleType>) {
    const roleRepository = this.entityManager.getRepository(Role);
    for (const role of Object.values(roles)) {
      let mess = `[${role.scope.name}] `;
      let roleModel = await roleRepository.findOne({
        where: { name: role.name, scope: role.scope.name },
      });
      if (!roleModel) {
        roleModel = new Role();
        roleModel.isPredefined = true;
        roleModel.name = role.name;
        roleModel.module = role.module;
        roleModel.hasId = !!role.scope.idParam;
        roleModel.scope = role.scope.name;
        mess += 'add role ';
      } else {
        mess += 'update role ';
      }
      mess += role.name;
      roleModel.permissions = role.permissions.map((p) => p.name);
      await roleRepository.save(roleModel);
      console.log(mess);
    }
  }
}
