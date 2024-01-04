import { constants as coreConstants } from '@roxavn/core/base';
import { BaseService, CreateRolesService, inject } from '@roxavn/core/server';

import { roles } from '../base/index.js';
import { CreateAdminUserHook } from './database.js';
import { GetOrCreateUserService, serverModule } from '../server/index.js';

@serverModule.injectable()
export class InstallHook extends BaseService {
  constructor(
    @inject(CreateRolesService)
    private createRolesService: CreateRolesService,
    @inject(CreateAdminUserHook)
    private createAdminUserHook: CreateAdminUserHook,
    @inject(GetOrCreateUserService)
    private getOrCreateUserService: GetOrCreateUserService
  ) {
    super();
  }

  async handle() {
    await this.createRolesService.handle(roles);
    await this.createAdminUserHook.handle();
    await this.getOrCreateUserService.handle({
      username: coreConstants.User.SYSTEM,
    });
  }
}
