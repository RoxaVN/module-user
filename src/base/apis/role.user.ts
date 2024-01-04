import {
  accessManager,
  ApiSource,
  IsOptional,
  Min,
  MinLength,
  PaginationRequest,
  TransformNumber,
} from '@roxavn/core/base';
import { permissions, scopes } from '../access.js';
import { baseModule } from '../module.js';
import { UserResponse } from './user.js';

const roleUserSource = new ApiSource<UserResponse>(
  [scopes.Role, accessManager.scopes.User],
  baseModule
);

class GetRoleUsersRequest extends PaginationRequest<GetRoleUsersRequest> {
  @Min(1)
  @TransformNumber()
  public readonly roleId: number;

  @MinLength(1)
  @IsOptional()
  public readonly scopeId?: string;

  // add field for DynamicModule
  @IsOptional()
  public readonly module?: string;

  // add field for DynamicScope
  @IsOptional()
  public readonly scope?: string;
}

class SearchRoleUsersRequest extends PaginationRequest<SearchRoleUsersRequest> {
  @IsOptional()
  public readonly usernameText?: string;

  @MinLength(1)
  @IsOptional()
  public readonly scopeId: string;

  @IsOptional()
  public readonly scope: string;
}

export const roleUserApi = {
  getMany: roleUserSource.getMany({
    validator: GetRoleUsersRequest,
    permission: permissions.ReadRoleUsers,
  }),
  search: roleUserSource.getMany({
    path: baseModule.apiPath('/roleUsers'),
    validator: SearchRoleUsersRequest,
    permission: permissions.ReadRoleUsers,
  }),
};
