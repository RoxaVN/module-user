import { Empty, WebRoute } from '@roxavn/core/base';

export const webRoutes = {
  ResetPassword: new WebRoute<
    Empty,
    { username: string; userId: string; token: string; ref?: string }
  >('/reset-password'),
};
