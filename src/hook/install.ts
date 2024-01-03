import { constants as coreConstants } from '@roxavn/core/base';
import { BaseService, CreateRoleService, inject } from '@roxavn/core/server';

import { roles } from '../base/index.js';
import { CreateAdminUserHook } from './database.js';
import { GetOrCreateUserService, serverModule } from '../server/index.js';

@serverModule.injectable()
export class InstallHook extends BaseService {
  constructor(
    @inject(CreateRoleService)
    private createRoleService: CreateRoleService,
    @inject(CreateAdminUserHook)
    private createAdminUserHook: CreateAdminUserHook,
    @inject(GetOrCreateUserService)
    private getOrCreateUserService: GetOrCreateUserService
  ) {
    super();
  }

  async handle() {
    await this.createRoleService.handle(roles);
    await this.createAdminUserHook.handle();
    await this.getOrCreateUserService.handle({
      username: coreConstants.User.SYSTEM,
    });
  }
}
