import { Select, SelectProps } from '@mantine/core';
import { ApiInput } from '@roxavn/core/web';

import { userApi } from '../../base/index.js';

export const UserInput = (props: Omit<SelectProps, 'data'>) => (
  <ApiInput
    {...props}
    api={userApi.search}
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

export default UserInput;
