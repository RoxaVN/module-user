import { Card, Container } from '@mantine/core';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { webRoutes } from '@roxavn/core/base';

import { LoginForm } from '../components/index.js';

const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <Container size={400} py={50}>
      <Card withBorder>
        <LoginForm
          onSuccess={() => navigate(params.get('ref') || webRoutes.Me.path)}
        />
      </Card>
    </Container>
  );
};

export default LoginPage;
