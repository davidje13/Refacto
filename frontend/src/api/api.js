import RetroListTracker from './RetroListTracker';
import SlugTracker from './SlugTracker';
import RetroTracker from './RetroTracker';

const API_BASE = '/api';
const WS_BASE = `ws://${document.location.host}${API_BASE}`;

export const retroListTracker = new RetroListTracker(API_BASE);
export const slugTracker = new SlugTracker(API_BASE);
export const retroTracker = new RetroTracker(API_BASE, WS_BASE);
