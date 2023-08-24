import {
  accessManager,
  ApiSource,
  ArrayMinSize,
  BadRequestException,
  Collection,
  ExactProps,
  IsOptional,
  Min,
  MinLength,
  TransformArray,
  TransformNumber,
} from '@roxavn/core/base';
import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';
import { RoleResponse } from './role.js';

const userRoleSource = new ApiSource<RoleResponse & { scopeId?: string }>(
  [accessManager.scopes.User, scopes.Role],
  baseModule
);

class CreateUserRoleRequest extends ExactProps<CreateUserRoleRequest> {
  @MinLength(1)
  public readonly userId: string;

  @Min(1)
  @TransformNumber()
  public readonly roleId: number;

  @IsOptional()
  public readonly scopeId?: string;

  // add field for DynamicModule
  @IsOptional()
  public readonly module?: string;

  // add field for DynamicScope
  @IsOptional()
  public readonly scope?: string;
}

class DeleteUserRoleRequest extends CreateUserRoleRequest {}

class GetUserRolesRequest extends ExactProps<GetUserRolesRequest> {
  @MinLength(1)
  public readonly userId: string;

  @ArrayMinSize(1)
  @TransformArray()
  @IsOptional()
  public readonly scopes?: string[];

  @IsOptional()
  public readonly scope?: string;

  @IsOptional()
  public readonly scopeId?: string;
}

class GetUserRoleModulesRequest extends ExactProps<GetUserRoleModulesRequest> {
  @MinLength(1)
  public readonly userId: string;
}

export const userRoleApi = {
  create: userRoleSource.createRelation({
    validator: CreateUserRoleRequest,
    permission: permissions.CreateUserRole,
  }),
  delete: userRoleSource.delete({
    validator: DeleteUserRoleRequest,
    permission: permissions.DeleteUserRole,
  }),
  getAll: userRoleSource.getAll({
    validator: GetUserRolesRequest,
    permission: permissions.ReadUserRoles,
  }),
  modules: userRoleSource.custom<
    GetUserRoleModulesRequest,
    Collection<RoleResponse>,
    BadRequestException
  >({
    method: 'GET',
    path: userRoleSource.apiPath() + '/modules',
    validator: GetUserRoleModulesRequest,
    permission: permissions.ReadUserRoles,
  }),
};
