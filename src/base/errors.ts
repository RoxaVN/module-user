import { ValidationException } from '@roxavn/core';
import { baseModule } from './module.js';

export const wrongRetypePasswordException = new ValidationException({
  retypePassword: {
    key: 'Error.WrongRetypePassword',
    ns: baseModule.escapedName,
  },
});

export const wrongPasswordException = new ValidationException({
  password: {
    key: 'Error.WrongPassword',
    ns: baseModule.escapedName,
  },
});
