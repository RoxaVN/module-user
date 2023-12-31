import { InferApiRequest } from '@roxavn/core/base';
import { InjectDatabaseService } from '@roxavn/core/server';

import { userIdentityApi } from '../../base/index.js';
import { serverModule } from '../module.js';
import { Identity } from '../entities/index.js';

@serverModule.useApi(userIdentityApi.getAll)
export class GetUserIdentitiesApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof userIdentityApi.getAll>) {
    const items = await this.entityManager.getRepository(Identity).find({
      where: {
        userId: request.userId,
        subject: request.subject,
        type: request.type,
      },
    });
    return { items };
  }
}
