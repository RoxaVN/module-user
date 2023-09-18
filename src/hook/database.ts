import { BaseService, DatabaseService, inject } from '@roxavn/core/server';
import { TokenService } from '@roxavn/module-utils/server';

import {
  Identity,
  Role,
  User,
  UserRole,
  serverModule,
} from '../server/index.js';
import { roles } from '../base/access.js';
import { constants } from '../base/index.js';

@serverModule.injectable()
export class CreateAdminUserHook extends BaseService {
  constructor(
    @inject(DatabaseService) protected databaseService: DatabaseService,
    @inject(TokenService) protected tokenService: TokenService
  ) {
    super();
  }

  async handle() {
    const count = await this.databaseService.manager
      .getRepository(User)
      .count({ where: { username: 'admin' } });
    if (count < 1) {
      const identity = new Identity();
      identity.metadata = {
        password: await this.tokenService.hasher.hash('admin'),
      };
      const user = new User();
      user.username = 'admin';
      await this.databaseService.manager.getRepository(User).save(user);
      identity.user = user;
      identity.subject = user.id;
      identity.type = constants.identityTypes.PASSWORD;
      await this.databaseService.manager.getRepository(Identity).save(identity);

      const role = await this.databaseService.manager.findOneBy(Role, {
        name: roles.Admin.name,
        scope: roles.Admin.scope.name,
      });
      if (role) {
        const adminRole = new UserRole();
        adminRole.user = user;
        adminRole.role = role;
        adminRole.scope = role.scope;
        await this.databaseService.manager
          .getRepository(UserRole)
          .save(adminRole);
      }
    }
  }
}
