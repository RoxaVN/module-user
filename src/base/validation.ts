import { I18nErrorField } from '@roxavn/core/base';
import { Matches, ValidationOptions } from 'class-validator';

import { baseModule } from './module.js';

export const IsUsername = (
  validationOptions?: ValidationOptions
): PropertyDecorator => {
  return Matches(/^[a-z][a-z0-9\.]*[a-z0-9]$/, {
    ...validationOptions,
    context: {
      key: 'Validation.IsUsername',
      ns: baseModule.escapedName,
    } as I18nErrorField,
  });
};
