import listCommands from 'json-immutability-helper/commands/list';
import { context as defaultContext, type Spec } from 'json-immutability-helper';

export type { Spec };

export const context = defaultContext.with(listCommands);
