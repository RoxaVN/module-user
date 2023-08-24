import {
  ApiSource,
  ExactProps,
  IsOptional,
  Min,
  MinLength,
  TransformNumber,
} from '@roxavn/core/base';
import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';

const accessTokenSource = new ApiSource<{
  id: string;
  userId: string;
  ipAddress: string;
  userAgent?: string;
  createdDate: Date;
  updatedDate: Date;
  expiryDate: Date;
}>([scopes.AccessToken], baseModule);

class DeleteAccessTokenRequest extends ExactProps<DeleteAccessTokenRequest> {
  @MinLength(1)
  public readonly accessTokenId: string;
}

class GetAccessTokensRequest extends ExactProps<GetAccessTokensRequest> {
  @MinLength(1)
  @IsOptional()
  public readonly userId?: string;

  @Min(1)
  @TransformNumber()
  @IsOptional()
  public readonly page = 1;
}

export const accessTokenApi = {
  delete: accessTokenSource.delete({
    validator: DeleteAccessTokenRequest,
    permission: permissions.DeleteAccessToken,
  }),
  getMany: accessTokenSource.getMany({
    validator: GetAccessTokensRequest,
  }),
};
