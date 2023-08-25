import {
  ApiSource,
  ExactProps,
  MinLength,
  accessManager,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';
import { IdentityResponse } from './password.identity.js';

const userIdentitySource = new ApiSource<IdentityResponse>(
  [accessManager.scopes.User, scopes.Identity],
  baseModule
);

class GetUserIdentitiesRequest extends ExactProps<GetUserIdentitiesRequest> {
  @MinLength(1)
  public readonly userId: string;
}

export const userIdentityApi = {
  getAll: userIdentitySource.getAll({
    validator: GetUserIdentitiesRequest,
    permission: permissions.ReadIdentities,
  }),
};
