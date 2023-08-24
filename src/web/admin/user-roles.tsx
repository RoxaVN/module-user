import {
  ApiTable,
  IfCanAccessApi,
  ModuleT,
  PageItem,
  userService,
  webModule as coreWebModule,
} from '@roxavn/core/web';
import { IconEye, IconShieldChevron } from '@tabler/icons-react';
import { userRoleApi, roleApi } from '../../base/index.js';
import { webModule } from '../module.js';

const Page = () => {
  const { t } = webModule.useTranslation();
  const tCore = coreWebModule.useTranslation().t;

  return (
    <ApiTable
      api={roleApi.moduleStats}
      itemKey="userId"
      columns={{
        userId: { label: tCore('id'), reference: userService.reference },
        rolesCount: { label: t('roles') },
      }}
      cellActions={(item) => [
        {
          label: tCore('detail'),
          icon: IconEye,
          access: { api: userRoleApi.getAll },
          link: { href: item.userId },
        },
      ]}
    />
  );
};

export const userRolesPage = new PageItem({
  label: <ModuleT module={webModule} k="userRoles" />,
  path: 'user-roles',
  icon: IconShieldChevron,
  element: (
    <IfCanAccessApi api={roleApi.moduleStats}>
      <Page />
    </IfCanAccessApi>
  ),
});
