import React from 'react';
import { makeHooks } from 'json-immutability-helper/helpers/hooks';
import { context } from '../api/reducer';

export const { useEvent } = makeHooks(context, React);
