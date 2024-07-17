import React from 'react';
import listCommands from 'json-immutability-helper/commands/list';
import { context as defaultContext, type Spec } from 'json-immutability-helper';
import { makeHooks } from 'json-immutability-helper/helpers/hooks';

export type { Spec };

export const context = defaultContext.with(listCommands);

export const { useEvent, useScopedReducer } = makeHooks(context, React);
