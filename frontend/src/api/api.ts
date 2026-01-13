import type { RetroAuth, UserData } from '../shared/api-entities';
import { ConfigService } from './ConfigService';
import { RetroListTracker } from './RetroListTracker';
import { SlugTracker } from './SlugTracker';
import { RetroTracker } from './RetroTracker';
import { ArchiveService } from './ArchiveService';
import { RetroAuthService } from './RetroAuthService';
import { UserDataService } from './UserDataService';
import { RetroService } from './RetroService';
import { PasswordService } from './PasswordService';
import { GiphyService } from './GiphyService';
import { AsyncValue } from '../helpers/AsyncValue';
import { AsyncValueMap } from '../helpers/AsyncValueMap';
import { DiagnosticsService } from './DiagnosticsService';

const { protocol, host } = document.location;
const secure = protocol !== 'http:';

export const API_BASE = '/api';
export const WS_BASE = `${secure ? 'wss' : 'ws'}://${host}${API_BASE}`;

export const configService = new ConfigService(API_BASE);
export const diagnosticsService = new DiagnosticsService(API_BASE, 5);
export const retroListTracker = new RetroListTracker(API_BASE);
export const slugTracker = new SlugTracker(API_BASE);
export const retroTracker = new RetroTracker(WS_BASE, diagnosticsService);
export const archiveService = new ArchiveService(API_BASE);
export const retroAuthService = new RetroAuthService(API_BASE);
export const retroService = new RetroService(API_BASE);
export const userDataService = new UserDataService(API_BASE);
export const passwordService = new PasswordService(API_BASE);
export const giphyService = new GiphyService(API_BASE);

export const retroAuthTracker = new AsyncValueMap<string, RetroAuth>();
export const userDataTracker = new AsyncValue<UserData | null>();
