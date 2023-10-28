import { TextEncoder } from 'node:util';

// https://github.com/jsdom/jsdom/issues/2524
global.TextEncoder = TextEncoder;
