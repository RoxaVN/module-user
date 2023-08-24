import {
  ApiSource,
  BadRequestException,
  Empty,
  ExactProps,
  ForbiddenException,
  MinLength,
  TokenAuthData,
  UnauthorizedException,
} from '@roxavn/core/base';
import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';

export type IdentityResponse = {
  id: string;
  subject: string;
  type: string;
  userId: string;
  metadata?: any;
  createdDate: Date;
  updatedDate: Date;
};

const passwordIdentitySource = new ApiSource<IdentityResponse>(
  [scopes.PasswordIdentity],
  baseModule
);

class AuthRequest extends ExactProps<AuthRequest> {
  @MinLength(1)
  public readonly username!: string;

  @MinLength(1)
  public readonly password!: string;
}

class ResetPasswordRequest extends ExactProps<ResetPasswordRequest> {
  @MinLength(1)
  public readonly userId!: string;

  @MinLength(1)
  public readonly token!: string;

  @MinLength(8)
  public readonly password!: string;
}

class RecoveryPasswordRequest extends ExactProps<RecoveryPasswordRequest> {
  @MinLength(1)
  public readonly userId: string;
}

export const passwordIdentityApi = {
  auth: passwordIdentitySource.custom<
    AuthRequest,
    TokenAuthData,
    UnauthorizedException
  >({
    method: 'POST',
    path: passwordIdentitySource.apiPath() + '/auth',
    validator: AuthRequest,
  }),
  reset: passwordIdentitySource.custom<
    ResetPasswordRequest,
    Empty,
    BadRequestException | UnauthorizedException | ForbiddenException
  >({
    method: 'POST',
    path: passwordIdentitySource.apiPath() + '/reset',
    validator: ResetPasswordRequest,
  }),
  recovery: passwordIdentitySource.custom<
    RecoveryPasswordRequest,
    { token: string },
    BadRequestException | UnauthorizedException | ForbiddenException
  >({
    method: 'POST',
    path: passwordIdentitySource.apiPath() + '/recovery',
    validator: RecoveryPasswordRequest,
    permission: permissions.RecoveryPassword,
  }),
};
