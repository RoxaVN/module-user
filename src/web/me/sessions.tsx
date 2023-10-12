import { Button, Card, Group, Text } from '@mantine/core';
import {
  ApiConfirmFormGroup,
  ApiList,
  authService,
  ModalTrigger,
  ModuleT,
  PageItem,
  utils,
  webModule,
} from '@roxavn/core/web';
import { IconCheckbox, IconCookie } from '@tabler/icons-react';
import { UAParser } from 'ua-parser-js';

import { accessTokenApi } from '../../base/index.js';

const Page = () => {
  const tokenData = authService.getTokenData();
  const { t } = webModule.useTranslation();

  return (
    <ApiList
      api={accessTokenApi.getMany}
      apiParams={{ userId: tokenData?.userId }}
      itemRender={(item, fetcherRef) => {
        const parser = new UAParser(item.userAgent);
        const result = parser.getResult();

        return (
          <Card>
            <Group position="apart">
              <Text weight="500">
                {item.ipAddress} - {item.userAgent ? result.os.name : ''}
              </Text>
              {tokenData?.id === item.id ? (
                <IconCheckbox color="green" />
              ) : (
                <ModalTrigger
                  title={t('logout')}
                  content={({ setOpened }) => (
                    <ApiConfirmFormGroup
                      api={accessTokenApi.delete}
                      apiParams={{ accessTokenId: item.id }}
                      onCancel={() => setOpened(false)}
                      onSuccess={() => {
                        fetcherRef.fetch(fetcherRef.currentParams);
                        setOpened(false);
                      }}
                    />
                  )}
                >
                  <Button variant="subtle">{t('logout')}</Button>
                </ModalTrigger>
              )}
            </Group>
            <Text size="sm" color="dimmed">
              {utils.Render.relativeTime(item.updatedDate)}
            </Text>
          </Card>
        );
      }}
    />
  );
};

export const sessionsPage = new PageItem({
  label: <ModuleT module={webModule} k="sessions" />,
  path: 'sessions',
  icon: IconCookie,
  element: <Page />,
});
