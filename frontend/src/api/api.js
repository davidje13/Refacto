import RetroListTracker from './RetroListTracker';
import SlugTracker from './SlugTracker';
import RetroTracker from './RetroTracker';
import RetroTokenService from './RetroTokenService';
import RetroService from './RetroService';
import ObservableTracker from './ObservableTracker';

const { protocol, host } = document.location;
const secure = (protocol !== 'http:');

const API_BASE = '/api';
const WS_BASE = `${secure ? 'wss' : 'ws'}://${host}${API_BASE}`;

export const retroListTracker = new RetroListTracker(API_BASE);
export const slugTracker = new SlugTracker(API_BASE);
export const retroTracker = new RetroTracker(API_BASE, WS_BASE);
export const retroTokenTracker = new ObservableTracker();
export const retroTokenService = new RetroTokenService(API_BASE);
export const retroService = new RetroService(API_BASE);
