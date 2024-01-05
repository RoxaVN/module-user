import { TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Prism } from '@mantine/prism';
import {
  ApiFormGroup,
  ApiTable,
  uiManager,
  webModule as coreWebModule,
  utils,
  IfCanAccessApi,
  ApiConfirmFormGroup,
  PageItem,
  ModuleT,
} from '@roxavn/core/web';
import { IconEye, IconKey, IconPlus, IconUsers } from '@tabler/icons-react';

import {
  passwordIdentityApi,
  userApi,
  userRoleApi,
  webRoutes,
} from '../../base/index.js';
import { webModule } from '../module.js';

const Page = () => {
  const { t } = webModule.useTranslation();
  const tCore = coreWebModule.useTranslation().t;

  return (
    <ApiTable
      api={userApi.getMany}
      header={t('userList')}
      headerActions={[
        {
          label: tCore('add'),
          icon: IconPlus,
          modal: {
            title: t('addUser'),
            children: (
              <ApiFormGroup
                api={userApi.create}
                fields={[
                  {
                    name: 'username',
                    input: <TextInput label={t('username')} />,
                  },
                ]}
              />
            ),
          },
        },
      ]}
      filters={[
        {
          name: 'usernameText',
          input: <TextInput label={t('username')} />,
        },
        {
          name: 'createdDate',
          input: (
            <DatePickerInput
              type="range"
              label={tCore('createdDate')}
              clearable
            />
          ),
        },
      ]}
      columns={{
        username: { label: t('username') },
        createdDate: {
          label: tCore('createdDate'),
          render: utils.Render.datetime,
        },
        updatedDate: {
          label: tCore('updatedDate'),
          render: utils.Render.relativeTime,
        },
      }}
      cellActions={(item) => [
        {
          label: t('roles'),
          icon: IconEye,
          access: { api: userRoleApi.getAll },
          link: { href: `user-roles/${item.id}` },
        },
        {
          label: t('resetPassword'),
          icon: IconKey,
          modal: ({ closeModal }) => ({
            title: t('resetUserPassword', { username: item.username }),
            children: (
              <ApiConfirmFormGroup
                api={passwordIdentityApi.recovery}
                apiParams={{ userId: item.id }}
                onCancel={closeModal}
                onSuccess={(data) => {
                  const link = webRoutes.ResetPassword.generate({
                    userId: item.id,
                    username: item.username,
                    token: data.token,
                  });
                  uiManager.alertModal(
                    <div>
                      <p>
                        {t('sendResetPasswordLink', {
                          name: item.username,
                        })}
                      </p>
                      <div style={{ maxWidth: '400px' }}>
                        <Prism language="markdown">
                          {`${location.protocol}://${location.host}${link}`}
                        </Prism>
                      </div>
                    </div>
                  );
                }}
              />
            ),
          }),
        },
      ]}
    />
  );
};

export const usersPage = new PageItem({
  label: <ModuleT module={webModule} k="userList" />,
  path: '',
  icon: IconUsers,
  element: (
    <IfCanAccessApi api={userApi.getMany}>
      <Page />
    </IfCanAccessApi>
  ),
});
