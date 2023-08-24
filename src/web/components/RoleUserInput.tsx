import { Select, SelectProps } from '@mantine/core';
import { ApiInput } from '@roxavn/core/web';

import { roleUserApi } from '../../base/index.js';

export const RoleUserInput = ({
  scope,
  scopeId,
  ...props
}: Omit<SelectProps, 'data'> & { scope: string; scopeId: string }) => (
  <ApiInput
    {...props}
    api={roleUserApi.search}
    apiParams={{ scope, scopeId }}
    convertData={(items) =>
      items.map((item) => ({
        value: item.id,
        label: item.username,
      }))
    }
    fetchOnFocus
    searchKey="usernameText"
    onSearchChangeProp="onSearchChange"
    component={Select}
    withinPortal
    searchable
  />
);

export default RoleUserInput;
