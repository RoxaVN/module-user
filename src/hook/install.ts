import { BaseService, CreateRoleService, inject } from '@roxavn/core/server';
import { roles } from '../base/index.js';
import { CreateAdminUserHook } from './database.js';
import { serverModule } from '../server/index.js';

@serverModule.injectable()
export class InstallHook extends BaseService {
  constructor(
    @inject(CreateRoleService) private createRoleService: CreateRoleService,
    @inject(CreateAdminUserHook)
    private createAdminUserHook: CreateAdminUserHook
  ) {
    super();
  }

  async handle() {
    await this.createRoleService.handle(roles);
    await this.createAdminUserHook.handle();
  }
}
