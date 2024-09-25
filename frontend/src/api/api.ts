import { ConfigService } from './ConfigService';
import { RetroListTracker } from './RetroListTracker';
import { SlugTracker } from './SlugTracker';
import { RetroTracker } from './RetroTracker';
import { ArchiveTracker } from './ArchiveTracker';
import { ArchiveService } from './ArchiveService';
import { RetroTokenService } from './RetroTokenService';
import { UserTokenService } from './UserTokenService';
import { RetroService } from './RetroService';
import { PasswordService } from './PasswordService';
import { GiphyService } from './GiphyService';
import { ObservableTracker } from '../rxjs/ObservableTracker';
import { SingleObservableTracker } from '../rxjs/SingleObservableTracker';

const { protocol, host } = document.location;
const secure = protocol !== 'http:';

export const API_BASE = '/api';
export const WS_BASE = `${secure ? 'wss' : 'ws'}://${host}${API_BASE}`;

export const configService = new ConfigService(API_BASE);
export const retroListTracker = new RetroListTracker(API_BASE);
export const slugTracker = new SlugTracker(API_BASE);
export const retroTracker = new RetroTracker(WS_BASE);
export const archiveTracker = new ArchiveTracker(API_BASE);
export const archiveService = new ArchiveService(API_BASE);
export const retroTokenService = new RetroTokenService(API_BASE);
export const retroService = new RetroService(API_BASE);
export const userTokenService = new UserTokenService(API_BASE);
export const passwordService = new PasswordService(API_BASE);
export const giphyService = new GiphyService(API_BASE);

export const retroTokenTracker = new ObservableTracker<string, string>();
export const userTokenTracker = new SingleObservableTracker<string>();
