import type { RetroAuth } from '../shared/api-entities';

export const COMMON_AUTH: RetroAuth = {
  retroToken: 'my-token',
  scopes: ['read', 'write', 'readArchives', 'manage'],
  expires: Number.MAX_SAFE_INTEGER,
};
