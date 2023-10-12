import { TextInput, PasswordInput, Title } from '@mantine/core';
import { InferApiResponse } from '@roxavn/core/base';
import {
  ApiFormGroup,
  authService,
  webModule as coreWebModule,
} from '@roxavn/core/web';

import { passwordIdentityApi } from '../../base/index.js';
import { webModule } from '../module.js';

interface LoginFormProps {
  onSuccess?: (data: InferApiResponse<typeof passwordIdentityApi.auth>) => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps): JSX.Element => {
  const { t } = webModule.useTranslation();
  const tCore = coreWebModule.useTranslation().t;
  return (
    <div>
      <Title order={4} align="center" mb="md">
        {tCore('login')}
      </Title>
      <ApiFormGroup
        api={passwordIdentityApi.auth}
        onSuccess={async (data) => {
          authService.setTokenData(data);
          await authService.authenticate(data);
          onSuccess && onSuccess(data);
        }}
        fields={[
          { name: 'username', input: <TextInput label={t('username')} /> },
          {
            name: 'password',
            input: <PasswordInput autoComplete="true" label={t('password')} />,
          },
        ]}
      />
    </div>
  );
};
