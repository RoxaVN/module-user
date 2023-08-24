import { WebModule } from '@roxavn/core/web';
import { baseModule } from '../base/index.js';

const webModule = WebModule.fromBase(baseModule);

export { webModule };
