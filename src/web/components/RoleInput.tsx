import { Select, SelectProps } from '@mantine/core';
import { InferApiRequest } from '@roxavn/core/base';
import { ApiInput } from '@roxavn/core/web';

import { roleApi } from '../../base/index.js';

export const RoleInput = (
  props: Omit<SelectProps, 'data'> & {
    apiParams?: InferApiRequest<typeof roleApi.getMany>;
  }
) => (
  <ApiInput
    {...props}
    api={roleApi.getMany}
    convertData={(items) =>
      items.map((item) => ({
        value: item.id as any,
        label: item.scope + ' ' + item.name,
      }))
    }
    fetchOnFocus
    searchKey="scopeText"
    onSearchChangeProp="onSearchChange"
    component={Select}
    withinPortal
    searchable
  />
);
