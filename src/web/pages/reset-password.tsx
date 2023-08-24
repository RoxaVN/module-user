import { Card, Container } from '@mantine/core';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { webRoutes } from '@roxavn/core/base';

import { ResetPasswordForm } from '../components/index.js';

const ResetPasswordPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <Container size={400} py={50}>
      <Card withBorder>
        <ResetPasswordForm
          userId={params.get('userId') || ''}
          username={params.get('username') || ''}
          token={params.get('token') || ''}
          onSuccess={() => navigate(webRoutes.Login.path)}
        />
      </Card>
    </Container>
  );
};

export default ResetPasswordPage;
