import { Select } from '@mantine/core';
import {
  ApiConfirmFormGroup,
  ApiFormGroup,
  IfCanAccessApi,
  userService,
  utils,
  webModule as coreWebModule,
} from '@roxavn/core/web';
import { ApiTable, useApi } from '@roxavn/core/web';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Fragment } from 'react';

import { roleApi, roleUserApi, userRoleApi } from '../../base/index.js';
import { webModule } from '../module.js';

export interface RoleUsersProps {
  module?: string;
  scope?: string;
  scopeId?: string;
}

export const RoleUsers = ({ scope, scopeId, module }: RoleUsersProps) => {
  const { data } = useApi(roleApi.getMany, { scope, scopeId, module });
  const { t } = webModule.useTranslation();
  const tCore = coreWebModule.useTranslation().t;

  if (data) {
    const selectInput = (
      <Select
        withinPortal
        label={t('role')}
        data={data.items.map((item) => ({
          value: item.id as any,
          label: item.name,
        }))}
      />
    );
    return (
      <IfCanAccessApi
        api={roleUserApi.getMany}
        apiParams={{ scope, scopeId, module }}
      >
        <ApiTable
          api={roleUserApi.getMany}
          apiParams={{ roleId: data.items[0]?.id, scopeId, module, scope }}
          filters={[{ name: 'roleId', input: selectInput }]}
          locationKey=""
          headerActions={[
            {
              label: tCore('add'),
              icon: IconPlus,
              modal: {
                title: t('addRole'),
                children: (
                  <ApiFormGroup
                    api={userRoleApi.create}
                    apiParams={{ scopeId, module, scope }}
                    fields={[
                      {
                        name: 'userId',
                        input: <userService.userInput label={t('user')} />,
                      },
                      { name: 'roleId', input: selectInput },
                    ]}
                  />
                ),
              },
            },
          ]}
          columns={{
            id: { label: tCore('id'), reference: userService.reference },
            username: { label: t('username') },
            createdDate: {
              label: tCore('createdDate'),
              render: utils.Render.datetime,
            },
          }}
          cellActions={(item, fetcherRef) => [
            {
              label: tCore('delete'),
              icon: IconTrash,
              modal: ({ closeModal }) => ({
                title: t('deleteUserRole', {
                  role: data.items.find(
                    (i) => i.id === fetcherRef.currentParams.roleId
                  )?.name,
                }),
                children: (
                  <ApiConfirmFormGroup
                    api={userRoleApi.delete}
                    apiParams={{
                      roleId: fetcherRef.currentParams.roleId,
                      userId: item.id,
                      scopeId,
                      module,
                      scope,
                    }}
                    onCancel={closeModal}
                  />
                ),
              }),
            },
          ]}
        />
      </IfCanAccessApi>
    );
  }
  return <Fragment />;
};

export default RoleUsers;
