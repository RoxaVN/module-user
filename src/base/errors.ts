import { ValidationException } from '@roxavn/core';
import { baseModule } from './module.js';

export const wrongRetypePasswordException = new ValidationException({
  retypePassword: {
    key: 'Error.WrongRetypePassword',
    ns: baseModule.escapedName,
  },
});
