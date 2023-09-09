import { accessManager } from '@roxavn/core/base';
import { baseModule } from './module.js';

export const scopes = accessManager.makeScopes(baseModule, {
  Role: { name: 'role' },
  AccessToken: { name: 'accessToken' },
  Identity: { name: 'identity' },
  PasswordIdentity: { name: 'passwordIdentity' },
});

export const permissions = accessManager.makePermissions(scopes, {
  CreateUser: {},
  ReadUsers: {},
  ReadUser: {
    allowedScopes: [accessManager.scopes.Owner],
  },
  UpdateUser: {
    allowedScopes: [accessManager.scopes.Owner],
  },
  ReadUserRoles: {
    allowedScopes: [accessManager.scopes.Owner],
  },
  CreateUserRole: accessManager.permissions.CreateUserRole,
  DeleteUserRole: accessManager.permissions.DeleteUserRole,
  ReadRoleUsers: accessManager.permissions.ReadRoleUsers,
  ReadRoles: accessManager.permissions.ReadRoles,

  DeleteAccessToken: {
    allowedScopes: [accessManager.scopes.Owner],
  },
  ReadAccessTokens: {
    allowedScopes: [accessManager.scopes.Owner],
  },

  RecoveryPassword: {},

  CreateIdentity: {
    allowedScopes: [accessManager.scopes.AuthUser],
  },
  ReadIdentities: {
    allowedScopes: [accessManager.scopes.Owner],
  },
});

export const roles = accessManager.makeRoles(scopes, permissions, {});
