import {
  accessManager,
  ApiError,
  ApiSource,
  ArrayMaxSize,
  ArrayMinSize,
  Collection,
  ExactProps,
  IsArray,
  IsDateString,
  IsOptional,
  Max,
  MaxLength,
  Min,
  MinLength,
  TransformArray,
  TransformNumber,
} from '@roxavn/core/base';
import { baseModule } from '../module.js';
import { permissions } from '../access.js';
import { IsUsername } from '../validation.js';

export interface UserResponse {
  id: string;
  username: string;
  createdDate: Date;
  updatedDate: Date;
}

const userSource = new ApiSource<UserResponse>(
  [accessManager.scopes.User],
  baseModule
);

class SearchUsersRequest extends ExactProps<SearchUsersRequest> {
  @MinLength(1, { each: true })
  @ArrayMaxSize(20)
  @IsOptional()
  @TransformArray()
  public readonly ids?: string[];

  @IsOptional()
  public readonly username?: string;

  @IsOptional()
  public readonly usernameText?: string;
}

class GetUsersRequest extends ExactProps<GetUsersRequest> {
  @IsOptional()
  public readonly username?: string;

  @IsOptional()
  public readonly usernameText?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsDateString({}, { each: true })
  @IsOptional()
  public readonly createdDate?: Date[];

  @Min(1)
  @TransformNumber()
  @IsOptional()
  public readonly page?: number;

  @Min(1)
  @Max(100)
  @TransformNumber()
  @IsOptional()
  public readonly pageSize?: number;
}

class GetUserRequest extends ExactProps<GetUserRequest> {
  @MinLength(1)
  public readonly userId: string;
}

class CreateUserRequest extends ExactProps<CreateUserRequest> {
  @IsUsername()
  @MinLength(6)
  @MaxLength(32)
  public readonly username!: string;
}

export const userApi = {
  search: userSource.custom<
    SearchUsersRequest,
    Collection<{ id: string; username: string }>,
    ApiError
  >({
    method: 'GET',
    path: userSource.apiPath() + '/public/search',
    validator: SearchUsersRequest,
  }),
  getMany: userSource.getMany({
    validator: GetUsersRequest,
    permission: permissions.ReadUsers,
  }),
  getOne: userSource.getOne({
    validator: GetUserRequest,
    permission: permissions.ReadUser,
  }),
  create: userSource.create({
    validator: CreateUserRequest,
    permission: permissions.CreateUser,
  }),
};
